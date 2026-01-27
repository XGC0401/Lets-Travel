<template>
  <div class="page-container">
    <h2 class="page-title">Tour Management</h2>

    <el-card>
      <div class="filters">
        <el-input v-model="filters.keyword" placeholder="Search tour or guide" />
        <el-select v-model="filters.category" placeholder="Category">
          <el-option label="All" value="" />
          <el-option label="Food" value="Food" />
          <el-option label="Culture" value="Culture" />
          <el-option label="Adventure" value="Adventure" />
          <el-option label="Nightlife" value="Nightlife" />
        </el-select>
        <el-select v-model="filters.status" placeholder="Status">
          <el-option label="All" value="" />
          <el-option label="Live" value="Live" />
          <el-option label="Draft" value="Draft" />
          <el-option label="Paused" value="Paused" />
        </el-select>
        <el-button type="primary">Search</el-button>
        <el-button type="success" @click="openDialog">New Tour</el-button>
      </div>

      <el-table :data="tours" height="420">
        <el-table-column prop="name" label="Tour" />
        <el-table-column prop="guide" label="Guide" width="160" />
        <el-table-column prop="city" label="City" width="140" />
        <el-table-column prop="price" label="Price" width="120" />
        <el-table-column label="Rating" width="160">
          <template #default="scope">
            <el-rate v-model="scope.row.rating" disabled show-score text-color="#f59e0b" />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'Live' ? 'success' : 'info'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Actions" width="200">
          <template #default="scope">
            <div class="table-actions">
              <el-button size="small" @click="editTour(scope.row)">Edit</el-button>
              <el-button size="small" type="warning">Adjust Price</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="Tour Editor" width="520">
      <el-form :model="form" label-width="120">
        <el-form-item label="Tour Name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Guide">
          <el-input v-model="form.guide" />
        </el-form-item>
        <el-form-item label="City">
          <el-input v-model="form.city" />
        </el-form-item>
        <el-form-item label="Price">
          <el-input v-model="form.price" />
        </el-form-item>
        <el-form-item label="Status">
          <el-select v-model="form.status">
            <el-option label="Live" value="Live" />
            <el-option label="Draft" value="Draft" />
            <el-option label="Paused" value="Paused" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="dialogVisible = false">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";

const filters = reactive({
  keyword: "",
  category: "",
  status: ""
});

const tours = [
  { name: "Night Market Adventure", guide: "Yuna Lin", city: "Taipei", price: "$45", rating: 4.9, status: "Live" },
  { name: "Historic Old Town Walk", guide: "Carlos Diaz", city: "Seville", price: "$38", rating: 4.7, status: "Live" },
  { name: "Hidden Cafes", guide: "Ari Chen", city: "Tokyo", price: "$52", rating: 4.5, status: "Draft" },
  { name: "Street Art Ride", guide: "Maya Patel", city: "Mumbai", price: "$30", rating: 4.6, status: "Paused" }
];

const dialogVisible = ref(false);
const form = reactive({
  name: "",
  guide: "",
  city: "",
  price: "",
  status: "Live"
});

const openDialog = () => {
  Object.assign(form, { name: "", guide: "", city: "", price: "", status: "Live" });
  dialogVisible.value = true;
};

const editTour = (tour) => {
  Object.assign(form, tour);
  dialogVisible.value = true;
};
</script>
