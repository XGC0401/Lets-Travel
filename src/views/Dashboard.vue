<template>
  <div class="page-container">
    <h2 class="page-title">Overview Dashboard</h2>

    <div class="stat-grid">
      <el-card v-for="stat in stats" :key="stat.label">
        <div class="badge">
          <el-icon><component :is="stat.icon" /></el-icon>
          <span>{{ stat.label }}</span>
        </div>
        <h3>{{ stat.value }}</h3>
        <p>{{ stat.note }}</p>
      </el-card>
    </div>

    <el-row :gutter="16">
      <el-col :span="14">
        <el-card>
          <div class="section-title">Recent Bookings</div>
          <el-table :data="recentBookings" height="280">
            <el-table-column prop="id" label="Booking ID" width="120" />
            <el-table-column prop="tour" label="Tour" />
            <el-table-column prop="guide" label="Guide" width="140" />
            <el-table-column prop="status" label="Status" width="120">
              <template #default="scope">
                <el-tag :type="statusType(scope.row.status)">{{ scope.row.status }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card>
          <div class="section-title">Top Guides</div>
          <el-table :data="topGuides" height="280">
            <el-table-column prop="name" label="Guide" />
            <el-table-column prop="city" label="City" />
            <el-table-column label="Rating" width="120">
              <template #default="scope">
                <el-rate v-model="scope.row.rating" disabled show-score text-color="#f59e0b" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { MapLocation, User, Flag, Ticket } from "@element-plus/icons-vue";

const stats = [
  { label: "Active Guides", value: "248", note: "12 new this week", icon: User },
  { label: "Tours Live", value: "1,142", note: "34 awaiting approval", icon: MapLocation },
  { label: "Bookings Today", value: "386", note: "78% auto-confirmed", icon: Ticket },
  { label: "GMV (Monthly)", value: "$128,400", note: "+6.4% vs last month", icon: Flag }
];

const recentBookings = [
  { id: "BK-2201", tour: "Night Market Adventure", guide: "Yuna Lin", status: "Confirmed" },
  { id: "BK-2202", tour: "Historic Walk", guide: "Carlos Diaz", status: "Pending" },
  { id: "BK-2203", tour: "Hidden Cafes", guide: "Ari Chen", status: "Negotiating" },
  { id: "BK-2204", tour: "Street Art Ride", guide: "Maya Patel", status: "Completed" }
];

const topGuides = [
  { name: "Yuna Lin", city: "Taipei", rating: 4.9 },
  { name: "Carlos Diaz", city: "Seville", rating: 4.8 },
  { name: "Maya Patel", city: "Mumbai", rating: 4.7 },
  { name: "Ari Chen", city: "Kaohsiung", rating: 4.6 }
];

const statusType = (status) => {
  if (status === "Confirmed") return "success";
  if (status === "Pending") return "warning";
  if (status === "Negotiating") return "info";
  return "default";
};
</script>
