import { useRichText } from "../app/hooks/use-rich-text";
import { RichText } from "./RichText";

interface ProfileDescriptionProps {
  description: string;
}

export function ProfileDescription({ description }: ProfileDescriptionProps) {
  const [richText, isResolving] = useRichText(description);

  if (isResolving) {
    return <span>{description}</span>;
  }

  return <RichText text={richText.text} facets={richText.facets} />;
}
