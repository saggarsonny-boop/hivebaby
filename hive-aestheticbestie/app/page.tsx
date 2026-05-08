import AestheticExperience from "@/components/AestheticExperience";
import { HiveInstallHint } from "./_lib/HiveInstallHint";
import { HiveFirstVisitExplainer } from "./_lib/HiveFirstVisitExplainer";

export default function Home() {
  return (
    <>
      <HiveFirstVisitExplainer />
      <HiveInstallHint />
      <AestheticExperience />
    </>
  );
}
