<template>
  <div class="page-container">
    <h2 class="page-title">Transactions</h2>

    <div class="stat-grid">
      <el-card>
        <div class="badge">
          <el-icon><Wallet /></el-icon>
          <span>Processed Today</span>
        </div>
        <h3>$18,460</h3>
        <p>148 payments</p>
      </el-card>
      <el-card>
        <div class="badge">
          <el-icon><CreditCard /></el-icon>
          <span>Pending Payouts</span>
        </div>
        <h3>$6,740</h3>
        <p>32 guides</p>
      </el-card>
      <el-card>
        <div class="badge">
          <el-icon><Warning /></el-icon>
          <span>Chargebacks</span>
        </div>
        <h3>3</h3>
        <p>Under review</p>
      </el-card>
    </div>

    <el-card>
      <div class="section-title">Payment Ledger</div>
      <el-table :data="transactions" height="420">
        <el-table-column prop="id" label="Txn ID" width="140" />
        <el-table-column prop="booking" label="Booking" width="140" />
        <el-table-column prop="payer" label="Tourist" width="160" />
        <el-table-column prop="payee" label="Guide" width="160" />
        <el-table-column prop="amount" label="Amount" width="120" />
        <el-table-column prop="status" label="Status" width="140">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'Settled' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="Date" width="140" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { Wallet, CreditCard, Warning } from "@element-plus/icons-vue";

const transactions = [
  { id: "TX-9001", booking: "BK-2201", payer: "Ari Chen", payee: "Yuna Lin", amount: "$45", status: "Settled", date: "Jan 26" },
  { id: "TX-9002", booking: "BK-2202", payer: "Liam Zhu", payee: "Carlos Diaz", amount: "$38", status: "Pending", date: "Jan 26" },
  { id: "TX-9003", booking: "BK-2203", payer: "Nora Wang", payee: "Ari Chen", amount: "$48", status: "Pending", date: "Jan 25" },
  { id: "TX-9004", booking: "BK-2204", payer: "Sam Lee", payee: "Maya Patel", amount: "$30", status: "Settled", date: "Jan 25" }
];
</script>
