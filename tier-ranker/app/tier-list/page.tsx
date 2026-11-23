import { TierBoard } from "@/components/TierBoard";

export default function TierListPage() {
  return (
    <>
      <header className="page-header">
        <h1 className="page-title">Rank the system design stack</h1>
        <p className="page-lede">
          Drag each concept into a tier, then download your ranking as an image. Select a concept to read what it is and when to use it.
        </p>
      </header>
      <TierBoard />
    </>
  );
}
