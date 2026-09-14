import { cn } from "@/lib/utils";
import type { LandingSpecification } from "@/types/landing";
import type { LandingVariant } from "./SiteHeader";
import { SectionHeading } from "./SectionHeading";

const VARIANT_SECTION: Record<LandingVariant, string> = {
  a: "bg-white border-slate-100",
  b: "bg-slate-900 border-white/10",
  c: "bg-white border-stone-100",
};

const VARIANT_GROUP_TITLE: Record<LandingVariant, string> = {
  a: "text-slate-900",
  b: "text-white",
  c: "text-stone-900",
};

const VARIANT_ROW_BORDER: Record<LandingVariant, string> = {
  a: "divide-slate-100 border-slate-200",
  b: "divide-white/10 border-white/10",
  c: "divide-stone-100 border-stone-200",
};

const VARIANT_KEY: Record<LandingVariant, string> = {
  a: "text-slate-500",
  b: "text-slate-400",
  c: "text-stone-500",
};

const VARIANT_VALUE: Record<LandingVariant, string> = {
  a: "text-slate-900",
  b: "text-white",
  c: "text-stone-900",
};

export function SpecificationTable({
  id = "specifications",
  eyebrow,
  title,
  description,
  specs,
  variant,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  specs: LandingSpecification[];
  variant: LandingVariant;
}) {
  if (specs.length === 0) return null;

  const groups = new Map<string, LandingSpecification[]>();
  for (const spec of [...specs].sort((a, b) => a.sortOrder - b.sortOrder)) {
    const key = spec.groupName ?? "기본 사양";
    const list = groups.get(key) ?? [];
    list.push(spec);
    groups.set(key, list);
  }

  return (
    <section id={id} className={cn("border-b", VARIANT_SECTION[variant])}>
      <div className="mx-auto max-w-[1360px] px-6 py-20 lg:px-10">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} variant={variant} />

        <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
          {Array.from(groups.entries()).map(([groupName, rows]) => (
            <div key={groupName}>
              <h3 className={cn("mb-3 text-lg font-semibold", VARIANT_GROUP_TITLE[variant])}>
                {groupName}
              </h3>
              <table className={cn("w-full border-t text-sm", VARIANT_ROW_BORDER[variant])}>
                <tbody className={cn("divide-y", VARIANT_ROW_BORDER[variant])}>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <th
                        scope="row"
                        className={cn("w-1/3 py-3 pr-4 text-left font-medium", VARIANT_KEY[variant])}
                      >
                        {row.key}
                      </th>
                      <td className={cn("py-3 font-medium", VARIANT_VALUE[variant])}>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
