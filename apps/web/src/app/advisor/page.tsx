import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, AlertTriangle, ShieldCheck, PhoneCall, ChevronRight, Filter } from "lucide-react";

interface CustomerCase {
  id: string;
  name: string;
  employment_type: string;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW';
  trend: '↓↓↓' | '↓↓' | '→' | '↑';
  buffer_days: number;
  income_volatility: string;
  intervention_status: string;
  primary_source: string;
}

const MONITORED_CUSTOMERS: CustomerCase[] = [
  { id: '1', name: 'Ravi Kumar', employment_type: 'Gig Worker', risk_level: 'HIGH', trend: '↓↓↓', buffer_days: 9, income_volatility: '45% CV', intervention_status: 'Contact Requested', primary_source: 'Uber / Swiggy' },
  { id: '2', name: 'Anita Sharma', employment_type: 'Freelance Designer', risk_level: 'HIGH', trend: '↓↓', buffer_days: 11, income_volatility: '38% CV', intervention_status: 'Reviewing Plan', primary_source: 'Upwork' },
  { id: '3', name: 'Rahul Verma', employment_type: 'Gig Worker', risk_level: 'MEDIUM', trend: '→', buffer_days: 18, income_volatility: '25% CV', intervention_status: 'Monitored', primary_source: 'Zomato' },
  { id: '4', name: 'Priya Singh', employment_type: 'Salaried', risk_level: 'LOW', trend: '↑', buffer_days: 42, income_volatility: '8% CV', intervention_status: 'Stable', primary_source: 'TechCorp' },
  { id: '5', name: 'Suresh Patel', employment_type: 'Self Employed', risk_level: 'MEDIUM', trend: '↓↓', buffer_days: 14, income_volatility: '30% CV', intervention_status: 'Auto Recommendation', primary_source: 'Retail Store' },
];

export default function AdvisorPage() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />

      <main className="flex-1 p-8 max-w-6xl mx-auto space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold tracking-tight">Financial Wellbeing Officer Portal</h1>
              <span className="bg-primary/20 text-primary border border-primary/40 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold">
                Bank Deployment
              </span>
            </div>
            <p className="text-muted-foreground">Monitor high-risk customer trajectories & provide human-in-the-loop intervention support.</p>
          </div>
          <Button variant="outline" className="rounded-full space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter High Risk</span>
          </Button>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Monitored Customers</CardDescription>
              <CardTitle className="text-3xl font-black flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <span>142</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Assigned Portfolio: Region North-1</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>High Risk Cases</CardDescription>
              <CardTitle className="text-3xl font-black text-red-400 flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-400" />
                <span>12</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-red-400 font-semibold">Immediate Action Required</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Warning Watchlist</CardDescription>
              <CardTitle className="text-3xl font-black text-yellow-500">31</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Income volatility escalating</p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/60">
            <CardHeader className="pb-2">
              <CardDescription>Stable Trajectories</CardDescription>
              <CardTitle className="text-3xl font-black text-primary">99</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">Resilience Score &gt; 65</p>
            </CardContent>
          </Card>
        </div>

        {/* ADVISOR CASES TABLE */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle>Priority Customer Cases Requiring Support</CardTitle>
            <CardDescription>Row Level Security (RLS) ensures officers only view assigned bank customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground uppercase text-xs">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Segment</th>
                    <th className="py-3 px-4">Distress Risk</th>
                    <th className="py-3 px-4">Trajectory Trend</th>
                    <th className="py-3 px-4">Buffer Days</th>
                    <th className="py-3 px-4">Intervention Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MONITORED_CUSTOMERS.map((cust) => (
                    <tr key={cust.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold">
                        {cust.name}
                        <span className="block text-[11px] font-normal text-muted-foreground">{cust.primary_source}</span>
                      </td>
                      <td className="py-3.5 px-4 text-xs">{cust.employment_type}</td>
                      <td className="py-3.5 px-4">
                        {cust.risk_level === 'HIGH' && (
                          <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full">HIGH RISK</span>
                        )}
                        {cust.risk_level === 'MEDIUM' && (
                          <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2.5 py-1 rounded-full">MEDIUM</span>
                        )}
                        {cust.risk_level === 'LOW' && (
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">STABLE</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {cust.trend.includes('↓') ? <span className="text-red-400">{cust.trend}</span> : <span className="text-primary">{cust.trend}</span>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">{cust.buffer_days} days</td>
                      <td className="py-3.5 px-4 text-xs font-medium">{cust.intervention_status}</td>
                      <td className="py-3.5 px-4 text-right">
                        <Button size="sm" variant={cust.risk_level === 'HIGH' ? "default" : "outline"} className="rounded-full text-xs space-x-1">
                          <PhoneCall className="h-3 w-3" />
                          <span>Review</span>
                          <ChevronRight className="h-3 w-3 ml-0.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
