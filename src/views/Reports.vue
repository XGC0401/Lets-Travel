<template>
  <div class="page-container">
    <h2 class="page-title">Reports & Analytics</h2>

    <div class="stat-grid">
      <el-card>
        <div class="badge">
          <el-icon><TrendCharts /></el-icon>
          <span>Tour Demand Index</span>
        </div>
        <h3>82</h3>
        <p>Target: 90</p>
      </el-card>
      <el-card>
        <div class="badge">
          <el-icon><Star /></el-icon>
          <span>Average Rating</span>
        </div>
        <h3>4.7</h3>
        <p>+0.1 this month</p>
      </el-card>
      <el-card>
        <div class="badge">
          <el-icon><Connection /></el-icon>
          <span>Match Success Rate</span>
        </div>
        <h3>91%</h3>
        <p>Goal: 93%</p>
      </el-card>
    </div>

    <el-card>
      <div class="section-title">Monthly Report Summary</div>
      <el-table :data="reports">
        <el-table-column prop="month" label="Month" width="140" />
        <el-table-column prop="bookings" label="Bookings" width="140" />
        <el-table-column prop="gmv" label="GMV" width="160" />
        <el-table-column prop="disputes" label="Disputes" width="140" />
        <el-table-column prop="newGuides" label="New Guides" width="140" />
        <el-table-column prop="notes" label="Highlights" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { TrendCharts, Star, Connection } from "@element-plus/icons-vue";

const reports = [
  {
    month: "Dec 2025",
    bookings: 10240,
    gmv: "$312,400",
    disputes: 42,
    newGuides: 64,
    notes: "Holiday demand surge. Added safety training."
  },
  {
    month: "Nov 2025",
    bookings: 9410,
    gmv: "$288,100",
    disputes: 38,
    newGuides: 52,
    notes: "Strong growth in food tours."
  },
  {
    month: "Oct 2025",
    bookings: 8810,
    gmv: "$264,300",
    disputes: 49,
    newGuides: 47,
    notes: "Improved dispute SLA to 48 hrs."
  }
];
</script>
