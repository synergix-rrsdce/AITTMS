"use client"

import { useState, useEffect } from "react"
import BackendTest from "@/components/BackendTest"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Train, Clock, AlertTriangle, Activity, BarChart3, Settings } from "lucide-react"
import { TrainScheduleTable } from "@/components/train-schedule-table"
import { ConflictResolution } from "@/components/conflict-resolution"
import { PerformanceDashboard } from "@/components/performance-dashboard"
import { ScenarioAnalysis } from "@/components/scenario-analysis"

export default function TrainTrafficManagement() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeAlerts, setActiveAlerts] = useState(3)
  const [trainsOnTime, setTrainsOnTime] = useState(87)
  const [sectionUtilization, setSectionUtilization] = useState(73)
  const [count, setActiveTrains] = useState<number | null>(null)

  // Weather info state variables
  const [temperature, setTemperature] = useState<number | null>(null)
  const [humidity, setHumidity] = useState<number | null>(null)
  const [precipitation, setPrecipitation] = useState<number | null>(null)

  useEffect(() => {
    fetch("http://localhost:4001/api/weather")
      .then((res) => res.json())
      .then((data) => {
        setTemperature(
          data.temperature !== undefined && !isNaN(Number(data.temperature))
            ? Number(data.temperature)
            : null
        )
        setHumidity(
          data.humidity !== undefined && !isNaN(Number(data.humidity))
            ? Number(data.humidity)
            : null
        )
        setPrecipitation(
          data.precipitation !== undefined && !isNaN(Number(data.precipitation))
            ? Number(data.precipitation)
            : null
        )
      })
      .catch(() => {
        setTemperature(null)
        setHumidity(null)
        setPrecipitation(null)
      })
  }, [])

  useEffect(() => {
    fetch("http://localhost:4001/api/active")
      .then((res) => res.json())
      .then((data) => {
        // Example: expecting backend to return { count: 54 }
        if (data.count !== undefined) {
          setActiveTrains(data.count)
        }
      })
      .catch(() => setActiveTrains(null))
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const criticalAlerts = [
    {
      id: 1,
      type: "conflict",
      message: "Train 12345 and 67890 approaching same section",
      priority: "high",
      time: "14:23",
    },
    {
      id: 2,
      type: "delay",
      message: "Express train 11111 delayed by 15 minutes",
      priority: "medium",
      time: "14:20",
    },
    {
      id: 3,
      type: "maintenance",
      message: "Track maintenance scheduled on Section B",
      priority: "low",
      time: "14:15",
    },
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-secondary text-secondary-foreground"
      case "low":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
  {/* Backend Connectivity Test */}
  <BackendTest />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Railway Traffic Control Center</h1>
            <p className="text-muted-foreground">Section Controller Dashboard - {currentTime.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Activity className="w-4 h-4 mr-1" />
              System Active
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Weather Info Card */}
         
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Trains</CardTitle>
              <Train className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count !== null ? count : "Loading..."}</div>
              <p className="text-xs text-muted-foreground">+1 from last hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainsOnTime}%</div>
              <Progress value={trainsOnTime} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Section Utilization</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sectionUtilization}%</div>
              <Progress value={sectionUtilization} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{activeAlerts}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>

           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weather Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{temperature !== null ? temperature + "°C" : "Loading..."}</div>
              <div className="text-xs text-muted-foreground">Humidity: {humidity !== null ? humidity + "%" : "Loading..."}</div>
              <div className="text-xs text-muted-foreground">Precipitation: {precipitation !== null ? precipitation + "mm" : "Loading..."}</div>
            </CardContent>
          </Card>

        </div>

        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Critical Alerts & Notifications
            </CardTitle>
            <CardDescription>Real-time alerts requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <Alert key={alert.id} className="border-l-4 border-l-destructive">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <AlertTitle className="text-sm">{alert.message}</AlertTitle>
                        <AlertDescription className="text-xs">Time: {alert.time}</AlertDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(alert.priority)}>{alert.priority.toUpperCase()}</Badge>
                      <Button size="sm" variant="outline">
                        Resolve
                      </Button>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedule">Train Schedule</TabsTrigger>
            <TabsTrigger value="conflicts">Conflict Resolution</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <TrainScheduleTable />
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
            <ConflictResolution />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceDashboard />
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <ScenarioAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
