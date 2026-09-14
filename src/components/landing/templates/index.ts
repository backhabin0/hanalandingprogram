import type { ComponentType } from "react";
import type { LandingPage, LandingTemplateId } from "@/types/landing";
import { TemplateA } from "./TemplateA";
import { TemplateB } from "./TemplateB";
import { TemplateC } from "./TemplateC";

export const TEMPLATE_COMPONENTS: Record<LandingTemplateId, ComponentType<{ page: LandingPage }>> = {
  "template-a": TemplateA,
  "template-b": TemplateB,
  "template-c": TemplateC,
};

export { TemplateA, TemplateB, TemplateC };
