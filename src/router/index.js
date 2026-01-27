import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Users from "../views/Users.vue";
import Tours from "../views/Tours.vue";
import Bookings from "../views/Bookings.vue";
import Transactions from "../views/Transactions.vue";
import Disputes from "../views/Disputes.vue";
import Reports from "../views/Reports.vue";

const routes = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", component: Dashboard },
  { path: "/users", component: Users },
  { path: "/tours", component: Tours },
  { path: "/bookings", component: Bookings },
  { path: "/transactions", component: Transactions },
  { path: "/disputes", component: Disputes },
  { path: "/reports", component: Reports }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
