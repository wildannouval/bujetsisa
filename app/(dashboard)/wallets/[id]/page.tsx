import { getWalletWithTransactions } from "@/lib/actions/wallets";
import { notFound } from "next/navigation";
import { WalletDetailClient } from "./wallet-detail-client";

interface WalletDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WalletDetailPage({
  params,
}: WalletDetailPageProps) {
  const { id } = await params;
  const wallet = await getWalletWithTransactions(id);

  if (!wallet) {
    notFound();
  }

  return <WalletDetailClient wallet={wallet} />;
}
