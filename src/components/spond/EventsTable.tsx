"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDetailsDialog } from "@/components/spond/EventDetailsDialog";
import type { SpondEvent, SpondMember } from "@/lib/spond/types";

function formatDateTime(ts: string): string {
  return new Date(ts).toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventRow({
  event,
  onSelect,
}: {
  event: SpondEvent;
  onSelect: (event: SpondEvent) => void;
}) {
  const r = event.responses ?? {};
  const accepted = r.acceptedIds?.length ?? 0;
  const declined = r.declinedIds?.length ?? 0;
  const unanswered = r.unansweredIds?.length ?? 0;

  return (
    <TableRow className="cursor-pointer" onClick={() => onSelect(event)}>
      <TableCell className="text-muted-foreground">
        {formatDateTime(event.startTimestamp)}
      </TableCell>
      <TableCell>
        <Button
          variant="link"
          className="h-auto w-fit p-0 text-left text-foreground"
        >
          <span className={event.cancelled ? "line-through opacity-60" : ""}>
            {event.heading}
          </span>
        </Button>
      </TableCell>
      <TableCell>
        {event.cancelled ? (
          <Badge variant="destructive">Avlyst</Badge>
        ) : event.matchEvent ? (
          <Badge variant="outline">
            Kamp
            {event.matchInfo?.opponentName
              ? ` vs ${event.matchInfo.opponentName}`
              : ""}
          </Badge>
        ) : (
          <Badge variant="secondary">Arrangement</Badge>
        )}
      </TableCell>
      <TableCell className="text-right tabular-nums">{accepted}</TableCell>
      <TableCell className="text-right tabular-nums">{declined}</TableCell>
      <TableCell className="text-right tabular-nums">{unanswered}</TableCell>
    </TableRow>
  );
}

function EventsTabTable({
  events,
  emptyText,
  onSelect,
}: {
  events: SpondEvent[];
  emptyText: string;
  onSelect: (event: SpondEvent) => void;
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Dato</TableHead>
            <TableHead>Arrangement</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Påmeldt</TableHead>
            <TableHead className="text-right">Avslått</TableHead>
            <TableHead className="text-right">Ikke svart</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            events.map((e) => (
              <EventRow key={e.id} event={e} onSelect={onSelect} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function EventsTable({
  upcoming,
  past,
  members = [],
}: {
  upcoming: SpondEvent[];
  past: SpondEvent[];
  members?: SpondMember[];
}) {
  const [selectedEvent, setSelectedEvent] = React.useState<SpondEvent | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const namesById = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.id;
      // Event responses key by the club-membership id (`m.id`), while event
      // `owners` key by the personal profile id (`m.profile.id`) — a
      // different namespace. Map both so either lookup resolves a name.
      map.set(m.id, name);
      if (m.profile?.id) map.set(m.profile.id, name);
    }
    return map;
  }, [members]);

  function handleSelect(event: SpondEvent) {
    setSelectedEvent(event);
    setDialogOpen(true);
  }

  return (
    <Tabs
      defaultValue="upcoming"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Kommende <Badge variant="secondary">{upcoming.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="past">
            Tidligere <Badge variant="secondary">{past.length}</Badge>
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="upcoming" className="flex flex-col px-4 lg:px-6">
        <EventsTabTable
          events={upcoming}
          emptyText="Ingen kommende arrangementer."
          onSelect={handleSelect}
        />
      </TabsContent>
      <TabsContent value="past" className="flex flex-col px-4 lg:px-6">
        <EventsTabTable
          events={past}
          emptyText="Ingen tidligere arrangementer."
          onSelect={handleSelect}
        />
      </TabsContent>

      <EventDetailsDialog
        event={selectedEvent}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        namesById={namesById}
      />
    </Tabs>
  );
}
