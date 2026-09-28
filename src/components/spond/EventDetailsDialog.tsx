"use client";

import { CalendarIcon, MapPinIcon, UserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { SpondEvent } from "@/lib/spond/types";

function formatDateRange(start: string, end?: string): string {
  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  const s = new Date(start);
  const startStr = `${s.toLocaleDateString("nb-NO", dateOpts)} kl. ${s.toLocaleTimeString("nb-NO", timeOpts)}`;
  if (!end) return startStr;

  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) {
    return `${s.toLocaleDateString("nb-NO", dateOpts)} kl. ${s.toLocaleTimeString(
      "nb-NO",
      timeOpts
    )}–${e.toLocaleTimeString("nb-NO", timeOpts)}`;
  }
  return `${startStr} – ${e.toLocaleDateString("nb-NO", dateOpts)} kl. ${e.toLocaleTimeString(
    "nb-NO",
    timeOpts
  )}`;
}

function matchTypeLabel(type: string | undefined): string {
  switch (type) {
    case "HOME":
      return "Hjemmekamp";
    case "AWAY":
      return "Bortekamp";
    case "FRIENDLY":
      return "Vennskapskamp";
    default:
      return "Kamp";
  }
}

function AttendeeList({
  ids,
  namesById,
  emptyText,
}: {
  ids: string[];
  namesById: Map<string, string>;
  emptyText: string;
}) {
  if (ids.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {ids.map((id) => (
        <li key={id}>{namesById.get(id) ?? id}</li>
      ))}
    </ul>
  );
}

export function EventDetailsDialog({
  event,
  open,
  onOpenChange,
  namesById,
}: {
  event: SpondEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  namesById: Map<string, string>;
}) {
  const responses = event?.responses ?? {};
  const organizerId = event?.owners?.[0]?.id;
  const openTasks = event?.tasks?.openTasks?.length ?? 0;
  const assignedTasks = event?.tasks?.assignedTasks?.length ?? 0;
  const commentCount = event?.comments?.length ?? 0;

  return (
    <Dialog open={open && event !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        {event && (
          <>
            <DialogHeader>
              <DialogTitle>{event.heading}</DialogTitle>
              <DialogDescription className="flex items-center gap-1.5">
                <CalendarIcon className="size-3.5 shrink-0" />
                {formatDateRange(event.startTimestamp, event.endTimestamp)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-wrap gap-1.5">
              {event.cancelled && <Badge variant="destructive">Avlyst</Badge>}
              {event.hidden && <Badge variant="outline">Skjult</Badge>}
              {event.matchEvent && (
                <Badge variant="outline">
                  {matchTypeLabel(event.matchInfo?.type)}
                  {event.matchInfo?.opponentName
                    ? ` vs ${event.matchInfo.opponentName}`
                    : ""}
                </Badge>
              )}
            </div>

            {event.location && (
              <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPinIcon className="mt-0.5 size-4 shrink-0" />
                <span>
                  {[event.location.feature, event.location.address]
                    .filter(Boolean)
                    .join(", ") || "Ukjent sted"}
                </span>
              </div>
            )}

            {organizerId && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <UserIcon className="size-4 shrink-0" />
                Arrangør: {namesById.get(organizerId) ?? organizerId}
              </div>
            )}

            {event.description && (
              <p className="text-sm whitespace-pre-wrap">
                {event.description}
              </p>
            )}

            {event.matchEvent && event.matchInfo && (
              <div className="rounded-lg border p-3 text-sm">
                <div className="font-medium">
                  {event.matchInfo.teamName ?? "Oss"} vs{" "}
                  {event.matchInfo.opponentName ?? "Ukjent"}
                </div>
                <div className="text-muted-foreground">
                  {event.matchInfo.scoresSet
                    ? `Resultat: ${event.matchInfo.teamScore ?? "–"} – ${event.matchInfo.opponentScore ?? "–"}`
                    : "Resultat ikke registrert"}
                </div>
              </div>
            )}

            <Separator />

            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#0ca30c]" />
                  Påmeldt ({responses.acceptedIds?.length ?? 0})
                </div>
                <AttendeeList
                  ids={responses.acceptedIds ?? []}
                  namesById={namesById}
                  emptyText="Ingen påmeldte."
                />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-destructive" />
                  Avslått ({responses.declinedIds?.length ?? 0})
                </div>
                <AttendeeList
                  ids={responses.declinedIds ?? []}
                  namesById={namesById}
                  emptyText="Ingen har avslått."
                />
              </div>
              <div>
                <div className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground" />
                  Ikke svart ({responses.unansweredIds?.length ?? 0})
                </div>
                <AttendeeList
                  ids={responses.unansweredIds ?? []}
                  namesById={namesById}
                  emptyText="Alle har svart."
                />
              </div>
            </div>

            {(openTasks + assignedTasks > 0 || commentCount > 0) && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {openTasks + assignedTasks > 0 && (
                    <span>{openTasks + assignedTasks} oppgaver</span>
                  )}
                  {commentCount > 0 && <span>{commentCount} kommentarer</span>}
                </div>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
