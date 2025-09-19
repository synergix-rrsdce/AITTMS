"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, TrendingDown, Clock, Train, Users, BarChart3 } from "lucide-react"

export function PerformanceDashboard() {
  const punctualityData = [
    { time: "08:00", onTime: 95, delayed: 5 },
    { time: "10:00", onTime: 88, delayed: 12 },
    { time: "12:00", onTime: 82, delayed: 18 },
    { time: "14:00", onTime: 87, delayed: 13 },
    { time: "16:00", onTime: 91, delayed: 9 },
    { time: "18:00", onTime: 85, delayed: 15 },
    { time: "20:00", onTime: 93, delayed: 7 },
  ]

  const throughputData = [
    { hour: "08:00", trains: 12 },
    { hour: "09:00", trains: 18 },
    { hour: "10:00", trains: 22 },
    { hour: "11:00", trains: 19 },
    { hour: "12:00", trains: 25 },
    { hour: "13:00", trains: 28 },
    { hour: "14:00", trains: 24 },
    { hour: "15:00", trains: 21 },
  ]

  const utilizationData = [
    { name: "Section A", value: 85, color: "#8b5cf6" },
    { name: "Section B", value: 72, color: "#06b6d4" },
    { name: "Section C", value: 91, color: "#10b981" },
    { name: "Section D", value: 68, color: "#f59e0b" },
  ]

  const delayReasons = [
    { reason: "Signal Issues", count: 12, percentage: 35 },
    { reason: "Weather", count: 8, percentage: 24 },
    { reason: "Technical Fault", count: 7, percentage: 21 },
    { reason: "Traffic Congestion", count: 5, percentage: 15 },
    { reason: "Other", count: 2, percentage: 5 },
  ]

  const kpiData = [
    {
      title: "Average Delay",
      value: "4.2 min",
      change: -0.8,
      trend: "down",
      icon: Clock,
      color: "text-green-600",
    },
    {
      title: "Daily Throughput",
      value: "247 trains",
      change: 12,
      trend: "up",
      icon: Train,
      color: "text-blue-600",
    },
    {
      title: "Passenger Satisfaction",
      value: "94.2%",
      change: 2.1,
      trend: "up",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Section Efficiency",
      value: "79.1%",
      change: -1.2,
      trend: "down",
      icon: BarChart3,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {kpi.change > 0 ? "+" : ""}
                      {kpi.change}%
                    </span>
                  </div>
                </div>
                <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="punctuality" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="punctuality">Punctuality</TabsTrigger>
          <TabsTrigger value="throughput">Throughput</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="punctuality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>On-Time Performance Trends</CardTitle>
              <CardDescription>Real-time punctuality metrics throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={punctualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="onTime" stroke="#10b981" strokeWidth={2} name="On Time (%)" />
                    <Line type="monotone" dataKey="delayed" stroke="#ef4444" strokeWidth={2} name="Delayed (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="throughput" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Train Throughput</CardTitle>
              <CardDescription>Number of trains processed per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={throughputData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="trains" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Section Utilization</CardTitle>
                <CardDescription>Current capacity utilization by section</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {utilizationData.map((section, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{section.name}</span>
                        <span className="font-medium">{section.value}%</span>
                      </div>
                      <Progress value={section.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delay Analysis</CardTitle>
                <CardDescription>Primary causes of train delays today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {delayReasons.map((reason, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
                        />
                        <span className="text-sm">{reason.reason}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{reason.count}</Badge>
                        <span className="text-sm text-muted-foreground">{reason.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
                <CardDescription>AI-generated insights and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Peak Hour Optimization</h4>
                    <p className="text-sm text-blue-800">
                      Consider increasing signal frequency during 12:00-14:00 to improve throughput by an estimated 15%.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Weather Preparedness</h4>
                    <p className="text-sm text-green-800">
                      Weather-related delays decreased by 30% this month due to improved forecasting integration.
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <h4 className="font-medium text-orange-900 mb-2">Maintenance Scheduling</h4>
                    <p className="text-sm text-orange-800">
                      Schedule Section B maintenance during 02:00-05:00 window to minimize service impact.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Predictive Analytics</CardTitle>
                <CardDescription>Forecasted performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Expected On-Time Performance (Next 4 Hours)</span>
                      <span className="font-medium text-green-600">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Predicted Throughput Efficiency</span>
                      <span className="font-medium text-blue-600">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Risk of Major Delays</span>
                      <span className="font-medium text-orange-600">12%</span>
                    </div>
                    <Progress value={12} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
