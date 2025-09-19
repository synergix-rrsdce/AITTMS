"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Play, Save, Download, Lightbulb, TrendingUp, AlertTriangle } from "lucide-react"

interface Scenario {
  id: string
  name: string
  description: string
  parameters: {
    trainDelay: number
    weatherCondition: string
    maintenanceWindow: string
    trafficVolume: string
  }
  results?: {
    impactedTrains: number
    averageDelay: number
    throughputChange: number
    recommendations: string[]
  }
  status: "draft" | "running" | "completed"
}

export function ScenarioAnalysis() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: "S001",
      name: "Heavy Rain Impact",
      description: "Simulate the impact of heavy rainfall on train operations during peak hours",
      parameters: {
        trainDelay: 15,
        weatherCondition: "heavy_rain",
        maintenanceWindow: "none",
        trafficVolume: "high",
      },
      results: {
        impactedTrains: 18,
        averageDelay: 12.5,
        throughputChange: -25,
        recommendations: [
          "Implement speed restrictions on affected sections",
          "Increase buffer time between trains by 20%",
          "Activate backup signaling systems",
        ],
      },
      status: "completed",
    },
    {
      id: "S002",
      name: "Signal Failure Recovery",
      description: "Test recovery procedures for major signal system failure",
      parameters: {
        trainDelay: 30,
        weatherCondition: "clear",
        maintenanceWindow: "emergency",
        trafficVolume: "medium",
      },
      status: "draft",
    },
  ])

  const [newScenario, setNewScenario] = useState<Partial<Scenario>>({
    name: "",
    description: "",
    parameters: {
      trainDelay: 0,
      weatherCondition: "clear",
      maintenanceWindow: "none",
      trafficVolume: "medium",
    },
  })

  const [isRunning, setIsRunning] = useState(false)

  const runSimulation = (scenarioId: string) => {
    setIsRunning(true)
    console.log(`[v0] Running simulation for scenario ${scenarioId}`)

    // Simulate API call
    setTimeout(() => {
      setScenarios((prev) =>
        prev.map((s) =>
          s.id === scenarioId
            ? {
                ...s,
                status: "completed" as const,
                results: {
                  impactedTrains: Math.floor(Math.random() * 30) + 5,
                  averageDelay: Math.floor(Math.random() * 20) + 5,
                  throughputChange: Math.floor(Math.random() * 40) - 20,
                  recommendations: [
                    "Optimize train scheduling during disruption",
                    "Implement alternative routing strategies",
                    "Enhance communication protocols",
                  ],
                },
              }
            : s,
        ),
      )
      setIsRunning(false)
    }, 3000)
  }

  const createScenario = () => {
    if (!newScenario.name || !newScenario.description) return

    const scenario: Scenario = {
      id: `S${String(scenarios.length + 1).padStart(3, "0")}`,
      name: newScenario.name,
      description: newScenario.description,
      parameters: newScenario.parameters!,
      status: "draft",
    }

    setScenarios((prev) => [...prev, scenario])
    setNewScenario({
      name: "",
      description: "",
      parameters: {
        trainDelay: 0,
        weatherCondition: "clear",
        maintenanceWindow: "none",
        trafficVolume: "medium",
      },
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-secondary" />
            What-If Scenario Analysis
          </CardTitle>
          <CardDescription>Simulate various operational scenarios to optimize decision-making</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="scenarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios">Existing Scenarios</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-4">
            {scenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <CardDescription>{scenario.description}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(scenario.status)}>
                      {scenario.status.charAt(0).toUpperCase() + scenario.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Train Delay</Label>
                      <p className="font-medium">{scenario.parameters.trainDelay} min</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Weather</Label>
                      <p className="font-medium capitalize">{scenario.parameters.weatherCondition.replace("_", " ")}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Maintenance</Label>
                      <p className="font-medium capitalize">{scenario.parameters.maintenanceWindow}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Traffic Volume</Label>
                      <p className="font-medium capitalize">{scenario.parameters.trafficVolume}</p>
                    </div>
                  </div>

                  {scenario.results && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {scenario.results.impactedTrains}
                              </div>
                              <p className="text-sm text-muted-foreground">Impacted Trains</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{scenario.results.averageDelay} min</div>
                              <p className="text-sm text-muted-foreground">Avg Delay</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4">
                            <div className="text-center">
                              <div
                                className={`text-2xl font-bold ${scenario.results.throughputChange >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {scenario.results.throughputChange > 0 ? "+" : ""}
                                {scenario.results.throughputChange}%
                              </div>
                              <p className="text-sm text-muted-foreground">Throughput Change</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>AI Recommendations</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1 mt-2">
                            {scenario.results.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm">
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {scenario.status === "draft" && (
                      <Button onClick={() => runSimulation(scenario.id)} disabled={isRunning}>
                        <Play className="w-4 h-4 mr-2" />
                        {isRunning ? "Running..." : "Run Simulation"}
                      </Button>
                    )}
                    {scenario.status === "completed" && (
                      <>
                        <Button variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Export Results
                        </Button>
                        <Button variant="secondary">
                          <Play className="w-4 h-4 mr-2" />
                          Re-run
                        </Button>
                      </>
                    )}
                    <Button variant="outline">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Scenario</CardTitle>
              <CardDescription>Define parameters for a new what-if analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input
                    id="scenario-name"
                    placeholder="Enter scenario name"
                    value={newScenario.name || ""}
                    onChange={(e) => setNewScenario((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="train-delay">Initial Train Delay (minutes)</Label>
                  <Input
                    id="train-delay"
                    type="number"
                    placeholder="0"
                    value={newScenario.parameters?.trainDelay || 0}
                    onChange={(e) =>
                      setNewScenario((prev) => ({
                        ...prev,
                        parameters: { ...prev.parameters!, trainDelay: Number.parseInt(e.target.value) || 0 },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the scenario and its objectives"
                  value={newScenario.description || ""}
                  onChange={(e) => setNewScenario((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Weather Condition</Label>
                  <Select
                    value={newScenario.parameters?.weatherCondition || "clear"}
                    onValueChange={(value) =>
                      setNewScenario((prev) => ({
                        ...prev,
                        parameters: { ...prev.parameters!, weatherCondition: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clear">Clear</SelectItem>
                      <SelectItem value="light_rain">Light Rain</SelectItem>
                      <SelectItem value="heavy_rain">Heavy Rain</SelectItem>
                      <SelectItem value="fog">Fog</SelectItem>
                      <SelectItem value="snow">Snow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Maintenance Window</Label>
                  <Select
                    value={newScenario.parameters?.maintenanceWindow || "none"}
                    onValueChange={(value) =>
                      setNewScenario((prev) => ({
                        ...prev,
                        parameters: { ...prev.parameters!, maintenanceWindow: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="extended">Extended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Traffic Volume</Label>
                  <Select
                    value={newScenario.parameters?.trafficVolume || "medium"}
                    onValueChange={(value) =>
                      setNewScenario((prev) => ({
                        ...prev,
                        parameters: { ...prev.parameters!, trafficVolume: value },
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="peak">Peak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={createScenario} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Create Scenario
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "Peak Hour Disruption",
                description: "Simulate major disruption during peak traffic hours",
                icon: TrendingUp,
              },
              {
                name: "Weather Emergency",
                description: "Test response to severe weather conditions",
                icon: AlertTriangle,
              },
              {
                name: "Signal System Failure",
                description: "Analyze impact of critical infrastructure failure",
                icon: AlertTriangle,
              },
              {
                name: "Maintenance Optimization",
                description: "Find optimal maintenance windows",
                icon: TrendingUp,
              },
            ].map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <template.icon className="w-8 h-8 text-secondary mt-1" />
                    <div className="space-y-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Button size="sm" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
