import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const APPS = [
  {
    href: "/estimator",
    title: "Property Value Estimator",
    description:
      "Enter a property's details to get an instant price prediction, save estimates, and compare multiple properties side-by-side.",
    badge: "Python backend",
  },
  {
    href: "/market",
    title: "Property Market Analysis",
    description:
      "Explore aggregate market statistics, filter segments, run what-if scenarios, and export data to CSV or PDF.",
    badge: "Java backend",
  },
];

export default function HomePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Housing Portal</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          One portal, two applications, both powered by a shared housing-price prediction model.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {APPS.map((app) => (
          <Link key={app.href} href={app.href} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-indigo-500">
              <CardHeader>
                <CardTitle className="group-hover:text-indigo-700">{app.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="mb-3 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                  {app.badge}
                </span>
                <p className="text-sm text-slate-600">{app.description}</p>
                <span className="mt-4 inline-block text-sm font-medium text-indigo-600">
                  Open →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
