<template>
  <div class="page-container">
    <h2 class="page-title">User & Guide Management</h2>

    <el-card>
      <div class="filters">
        <el-input v-model="filters.keyword" placeholder="Search name or email" />
        <el-select v-model="filters.role" placeholder="Role">
          <el-option label="All" value="" />
          <el-option label="Tourist" value="Tourist" />
          <el-option label="Guide" value="Guide" />
          <el-option label="Admin" value="Admin" />
        </el-select>
        <el-select v-model="filters.status" placeholder="Status">
          <el-option label="All" value="" />
          <el-option label="Active" value="Active" />
          <el-option label="Suspended" value="Suspended" />
        </el-select>
        <el-button type="primary">Apply Filters</el-button>
      </div>

      <el-table :data="users" height="420">
        <el-table-column prop="name" label="User" />
        <el-table-column prop="role" label="Role" width="120" />
        <el-table-column prop="location" label="Base City" width="160" />
        <el-table-column label="Rating" width="160">
          <template #default="scope">
            <el-rate v-model="scope.row.rating" disabled show-score text-color="#f59e0b" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="130">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'Active' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="220">
          <template #default>
            <div class="table-actions">
              <el-button size="small">View Profile</el-button>
              <el-button size="small" type="warning">Suspend</el-button>
              <el-button size="small" type="primary">Message</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card style="margin-top: 16px;">
      <div class="section-title">Recent Reviews</div>
      <el-table :data="reviews">
        <el-table-column prop="reviewer" label="Reviewer" width="180" />
        <el-table-column prop="target" label="Target" width="180" />
        <el-table-column label="Rating" width="160">
          <template #default="scope">
            <el-rate v-model="scope.row.rating" disabled show-score text-color="#f59e0b" />
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="Comment" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { reactive } from "vue";

const filters = reactive({
  keyword: "",
  role: "",
  status: ""
});

const users = [
  { name: "Yuna Lin", role: "Guide", location: "Taipei", rating: 4.9, status: "Active" },
  { name: "Carlos Diaz", role: "Guide", location: "Seville", rating: 4.7, status: "Active" },
  { name: "Ari Chen", role: "Tourist", location: "Tokyo", rating: 4.5, status: "Active" },
  { name: "Maya Patel", role: "Guide", location: "Mumbai", rating: 4.6, status: "Suspended" },
  { name: "Sofia Wang", role: "Admin", location: "Hong Kong", rating: 5.0, status: "Active" }
];

const reviews = [
  {
    reviewer: "Ari Chen",
    target: "Yuna Lin",
    rating: 5,
    comment: "Best food tour! Very flexible and friendly."
  },
  {
    reviewer: "Carlos Diaz",
    target: "Ari Chen",
    rating: 4.5,
    comment: "Great communication, prompt payment."
  },
  {
    reviewer: "Maya Patel",
    target: "Carlos Diaz",
    rating: 4.7,
    comment: "Loved the culture walk and stories."
  }
];
</script>
