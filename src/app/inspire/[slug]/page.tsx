import { notFound } from "next/navigation";
import { COLLECTIONS, getCollectionBySlug } from "@/lib/collections/data";
import { CollectionDetail } from "./CollectionDetail";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export default async function InspireDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();
  return <CollectionDetail collection={collection} />;
}
