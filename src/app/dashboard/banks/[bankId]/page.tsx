import { BankDetail } from '@/components/banks/bank-detail';

export default async function BankPage({ params }: { params: Promise<{ bankId: string }> }) {
  const { bankId } = await params;

  return <BankDetail bankId={bankId} />;
}
