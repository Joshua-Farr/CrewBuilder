"use client";

import * as React from "react";
import { CardImage } from "@/components/cards/card-image";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { TcgCard } from "@/lib/types";

type CardDetailDialogProps = {
  card: TcgCard | (Partial<TcgCard> & Pick<TcgCard, "code">);
  quantity?: number;
  children: React.ReactNode;
};

export function CardDetailDialog({ card, quantity, children }: CardDetailDialogProps) {
  const name = card.name ?? card.code;
  const hasStats = card.type || card.colors?.length || card.cost != null || card.life != null || card.power != null;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>
            {[card.code, card.set, card.rarity].filter(Boolean).join(" · ")}
            {quantity != null ? ` · x${quantity} in deck` : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
          <div className="relative mx-auto aspect-[5/7] w-full max-w-[220px] overflow-hidden rounded-xl bg-neutral-100 sm:mx-0">
            <CardImage card={card} alt={name} fill sizes="220px" className="object-contain" />
          </div>
          <div className="space-y-4">
            {hasStats ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {card.type ? <Badge>{card.type}</Badge> : null}
                  {card.colors?.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <CardDetailStat label="Cost" value={card.cost ?? "-"} />
                  <CardDetailStat label="Life" value={card.life ?? "-"} />
                  <CardDetailStat label="Power" value={card.power ?? "-"} />
                  <CardDetailStat label="Counter" value={card.counter ?? "-"} />
                  <CardDetailStat label="Attribute" value={card.attribute ?? "-"} />
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Full card details are not available for this entry.</p>
            )}
            {card.effect ? (
              <p className="rounded-2xl border border-border bg-neutral-50 p-4 text-sm leading-6 text-muted-foreground">{card.effect}</p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CardDetailStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-neutral-50 p-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
