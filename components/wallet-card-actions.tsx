"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { deleteWallet } from "@/lib/actions/wallets";
import { EditWalletDialog } from "@/components/edit-wallet-dialog";
import { toast } from "sonner";

export function WalletCardActions({ wallet }: { wallet: any }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-10 w-10 border border-transparent hover:border-border hover:bg-background/50 transition-all"
        >
          <IconDotsVertical size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-2xl border-border bg-card/90 backdrop-blur-xl p-2 shadow-2xl min-w-[200px]"
      >
        {/* EDIT ACTION */}
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="rounded-xl cursor-pointer font-bold uppercase text-[10px] tracking-widest p-3 focus:bg-indigo-500/10 focus:text-indigo-500"
        >
          <EditWalletDialog wallet={wallet} />
        </DropdownMenuItem>

        {/* DELETE ACTION */}
        <DropdownMenuItem
          className="text-red-500 focus:text-red-500 focus:bg-red-500/10 rounded-xl cursor-pointer font-bold uppercase text-[10px] tracking-widest p-3 mt-1"
          onClick={async () => {
            const result = await deleteWallet(wallet.id);
            if (result?.success) {
              toast.success("Wallet decommissioned successfully");
            } else {
              toast.error(result?.error || "Failed to delete wallet");
            }
          }}
        >
          <div className="flex w-full items-center">
            <IconTrash size={16} className="mr-3" /> Hapus Dompet
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
