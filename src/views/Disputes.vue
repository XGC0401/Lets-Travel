<template>
  <div class="page-container">
    <h2 class="page-title">Dispute Resolution Center</h2>

    <el-card>
      <div class="filters">
        <el-input v-model="filters.keyword" placeholder="Search dispute or booking" />
        <el-select v-model="filters.status" placeholder="Status">
          <el-option label="All" value="" />
          <el-option label="Open" value="Open" />
          <el-option label="Investigating" value="Investigating" />
          <el-option label="Resolved" value="Resolved" />
        </el-select>
        <el-select v-model="filters.priority" placeholder="Priority">
          <el-option label="All" value="" />
          <el-option label="High" value="High" />
          <el-option label="Medium" value="Medium" />
          <el-option label="Low" value="Low" />
        </el-select>
        <el-button type="primary">Filter</el-button>
      </div>

      <el-table :data="disputes" height="420">
        <el-table-column prop="id" label="Dispute" width="130" />
        <el-table-column prop="booking" label="Booking" width="140" />
        <el-table-column prop="reason" label="Reason" />
        <el-table-column prop="priority" label="Priority" width="120">
          <template #default="scope">
            <el-tag :type="priorityType(scope.row.priority)">{{ scope.row.priority }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="140">
          <template #default="scope">
            <el-tag :type="statusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="260">
          <template #default>
            <div class="table-actions">
              <el-button size="small">Assign Agent</el-button>
              <el-button size="small" type="warning">Request Evidence</el-button>
              <el-button size="small" type="success">Resolve</el-button>
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
  priority: ""
});

const disputes = [
  { id: "DP-3001", booking: "BK-2202", reason: "Guide arrived late", priority: "Medium", status: "Investigating" },
  { id: "DP-3002", booking: "BK-2203", reason: "Price disagreement", priority: "High", status: "Open" },
  { id: "DP-3003", booking: "BK-2204", reason: "Route changed", priority: "Low", status: "Resolved" }
];

const priorityType = (priority) => {
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warning";
  return "success";
};

const statusType = (status) => {
  if (status === "Open") return "danger";
  if (status === "Investigating") return "warning";
  return "success";
};
</script>
