import HiveIMR from "@/components/HiveIMR";
import { HiveInstallHint } from "./_lib/HiveInstallHint";
import { HiveFirstVisitExplainer } from "./_lib/HiveFirstVisitExplainer";

export default function Page() {
  return (
    <>
      <HiveFirstVisitExplainer />
      <HiveInstallHint />
      <HiveIMR />
    </>
  );
}
