"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Train, Clock, MapPin, Users } from "lucide-react"

interface TrainData {
  id: string
  name: string
  type: "Express" | "Local" | "Freight" | "Special"
  from: string
  to: string
  scheduled: string
  estimated: string
  status: "On Time" | "Delayed" | "Early" | "Cancelled"
  platform: string
  passengers: number
  priority: "High" | "Medium" | "Low"
}

export function TrainScheduleTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const [trainData, setTrainData] = useState<TrainData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetch("http://localhost:4001/api/trains")
      .then((res) => res.json())
      .then((data) => {
        setTrainData(data.trains || [])
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to fetch train data from backend.")
        setLoading(false)
      })
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "On Time":
        return "bg-green-100 text-green-800 border-green-200"
      case "Delayed":
        return "bg-red-100 text-red-800 border-red-200"
      case "Early":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredTrains = trainData.filter((train) => {
    const matchesSearch = train.name.toLowerCase().includes(searchTerm.toLowerCase()) || train.id.includes(searchTerm)
    const matchesStatus = statusFilter === "all" || train.status === statusFilter
    const matchesType = typeFilter === "all" || train.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading train data...</div>
  }
  if (error) {
    return <div className="text-center py-8 text-destructive">{error}</div>
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Train className="w-5 h-5" />
          Real-Time Train Schedule
        </CardTitle>
        <CardDescription>Monitor and manage train movements across your section</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by train name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="On Time">On Time</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
              <SelectItem value="Early">Early</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Express">Express</SelectItem>
              <SelectItem value="Local">Local</SelectItem>
              <SelectItem value="Freight">Freight</SelectItem>
              <SelectItem value="Special">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Train Schedule Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Train Details</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrains.map((train) => (
                <TableRow key={train.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{train.name}</div>
                      <div className="text-sm text-muted-foreground">#{train.id}</div>
                      <Badge variant="outline" className="text-xs">
                        {train.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        {train.from}
                      </div>
                      <div className="text-sm text-muted-foreground">→ {train.to}</div>
                      {train.passengers > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {train.passengers} passengers
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3" />
                        Scheduled: {train.scheduled}
                      </div>
                      <div className="text-sm text-muted-foreground">Estimated: {train.estimated}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(train.status)}>{train.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{train.platform}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(train.priority)}>{train.priority}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Modify
                      </Button>
                      <Button size="sm" variant="secondary">
                        Track
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredTrains.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No trains found matching your criteria</div>
        )}
      </CardContent>
    </Card>
  )
}
