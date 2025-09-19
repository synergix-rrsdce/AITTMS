"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Clock, CheckCircle, XCircle, Zap } from "lucide-react"

interface Conflict {
  id: string
  type: "crossing" | "platform" | "track" | "timing"
  severity: "critical" | "high" | "medium" | "low"
  trains: string[]
  location: string
  estimatedTime: string
  description: string
  suggestedActions: string[]
  status: "active" | "resolving" | "resolved"
}

export function ConflictResolution() {
  const [selectedConflict, setSelectedConflict] = useState<string | null>(null)
  const [resolutionStrategy, setResolutionStrategy] = useState("")

  const conflicts: Conflict[] = [
    {
      id: "C001",
      type: "crossing",
      severity: "critical",
      trains: ["12345 Rajdhani Express", "67890 Suburban Local"],
      location: "Junction A-B",
      estimatedTime: "14:35",
      description: "Two trains approaching same junction from opposite directions",
      suggestedActions: [
        "Hold Suburban Local at signal for 3 minutes",
        "Reduce Rajdhani Express speed by 10%",
        "Reroute Suburban Local via alternate track",
      ],
      status: "active",
    },
    {
      id: "C002",
      type: "platform",
      severity: "high",
      trains: ["11111 Goods Express", "22222 Shatabdi Express"],
      location: "Platform A1",
      estimatedTime: "14:45",
      description: "Platform occupancy conflict - both trains scheduled for same platform",
      suggestedActions: [
        "Assign Shatabdi Express to Platform A2",
        "Delay Goods Express by 5 minutes",
        "Use Platform B1 for Goods Express",
      ],
      status: "active",
    },
    {
      id: "C003",
      type: "track",
      severity: "medium",
      trains: ["33333 Special Charter"],
      location: "Section B-C",
      estimatedTime: "15:00",
      description: "Track maintenance window overlaps with scheduled train movement",
      suggestedActions: [
        "Reschedule maintenance to 15:30",
        "Reroute train via Section B-D-C",
        "Delay train by 20 minutes",
      ],
      status: "resolving",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case "resolving":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const handleResolveConflict = (conflictId: string, action: string) => {
    console.log(`[v0] Resolving conflict ${conflictId} with action: ${action}`)
    // In a real system, this would trigger the optimization algorithm
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Conflict Detection & Resolution
          </CardTitle>
          <CardDescription>AI-powered conflict detection with optimized resolution strategies</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="space-y-4">
            <TabsList>
              <TabsTrigger value="active">Active Conflicts</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="optimization">Optimization Engine</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {conflicts
                .filter((c) => c.status === "active" || c.status === "resolving")
                .map((conflict) => (
                  <Alert key={conflict.id} className="border-l-4 border-l-destructive">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(conflict.status)}
                            <AlertTitle className="text-base">
                              {conflict.type.charAt(0).toUpperCase() + conflict.type.slice(1)} Conflict - {conflict.id}
                            </AlertTitle>
                            <Badge className={getSeverityColor(conflict.severity)}>
                              {conflict.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <AlertDescription className="text-sm">
                            <div className="space-y-1">
                              <p>
                                <strong>Location:</strong> {conflict.location}
                              </p>
                              <p>
                                <strong>Estimated Time:</strong> {conflict.estimatedTime}
                              </p>
                              <p>
                                <strong>Trains Involved:</strong> {conflict.trains.join(", ")}
                              </p>
                              <p>
                                <strong>Description:</strong> {conflict.description}
                              </p>
                            </div>
                          </AlertDescription>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">AI-Suggested Resolution Strategies:</h4>
                        <div className="grid gap-2">
                          {conflict.suggestedActions.map((action, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-secondary" />
                                <span className="text-sm">{action}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleResolveConflict(conflict.id, action)}
                              >
                                Apply
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="destructive" size="sm">
                          Override Manual
                        </Button>
                        <Button variant="outline" size="sm">
                          Simulate Impact
                        </Button>
                        <Button variant="secondary" size="sm">
                          Request Alternative
                        </Button>
                      </div>
                    </div>
                  </Alert>
                ))}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">All Conflicts Resolved</h3>
                    <p className="text-muted-foreground">
                      No resolved conflicts in the current session. Resolved conflicts will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optimization Engine Status</CardTitle>
                  <CardDescription>Real-time optimization algorithms for conflict resolution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">98.5%</div>
                          <p className="text-sm text-muted-foreground">Algorithm Accuracy</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">1.2s</div>
                          <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">247</div>
                          <p className="text-sm text-muted-foreground">Conflicts Resolved Today</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Optimization Parameters</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Priority Weight</label>
                        <Select defaultValue="balanced">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="passenger">Passenger Priority</SelectItem>
                            <SelectItem value="freight">Freight Priority</SelectItem>
                            <SelectItem value="balanced">Balanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Optimization Goal</label>
                        <Select defaultValue="minimize_delay">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="minimize_delay">Minimize Delays</SelectItem>
                            <SelectItem value="maximize_throughput">Maximize Throughput</SelectItem>
                            <SelectItem value="safety_first">Safety First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
