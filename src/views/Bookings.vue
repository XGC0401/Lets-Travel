<template>
  <div class="page-container">
    <h2 class="page-title">Bookings & Requests</h2>

    <el-card>
      <div class="filters">
        <el-input v-model="filters.keyword" placeholder="Search booking, guide, tourist" />
        <el-select v-model="filters.status" placeholder="Status">
          <el-option label="All" value="" />
          <el-option label="Pending" value="Pending" />
          <el-option label="Confirmed" value="Confirmed" />
          <el-option label="Negotiating" value="Negotiating" />
          <el-option label="Completed" value="Completed" />
        </el-select>
        <el-date-picker v-model="filters.date" type="daterange" start-placeholder="Start" end-placeholder="End" />
        <el-button type="primary">Search</el-button>
      </div>

      <el-table :data="bookings" height="420">
        <el-table-column prop="id" label="Booking" width="120" />
        <el-table-column prop="tour" label="Tour" />
        <el-table-column prop="tourist" label="Tourist" width="160" />
        <el-table-column prop="guide" label="Guide" width="160" />
        <el-table-column prop="price" label="Price" width="120" />
        <el-table-column prop="status" label="Status" width="140">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="240">
          <template #default>
            <div class="table-actions">
              <el-button size="small">Approve</el-button>
              <el-button size="small" type="warning">Negotiate</el-button>
              <el-button size="small" type="danger">Cancel</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const filters = reactive({
  keyword: "",
  status: "",
  date: ""
});

const bookings = [
  { id: "BK-2201", tour: "Night Market Adventure", tourist: "Ari Chen", guide: "Yuna Lin", price: "$45", status: "Confirmed" },
  { id: "BK-2202", tour: "Historic Old Town Walk", tourist: "Liam Zhu", guide: "Carlos Diaz", price: "$38", status: "Pending" },
  { id: "BK-2203", tour: "Hidden Cafes", tourist: "Nora Wang", guide: "Ari Chen", price: "$48", status: "Negotiating" },
  { id: "BK-2204", tour: "Street Art Ride", tourist: "Sam Lee", guide: "Maya Patel", price: "$30", status: "Completed" }
];

const statusType = (status) => {
  if (status === "Confirmed") return "success";
  if (status === "Pending") return "warning";
  if (status === "Negotiating") return "info";
  return "default";
};
</script>
