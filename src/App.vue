<template>
  <div class="main">
    <Layout>
      <Content class="layout-content">
        <div class="a-right">
          <!-- <Icon type="md-refresh" size="32" :class="{ autoFresh }" :title="autoFresh ? '定时刷新' : '停止刷新'" @click="autoFresh = !autoFresh" /> -->
          <Input
            clearable
            style="width: 200px"
            v-model="orderId"
            placeholder="请输入订单号"
          />
          <Select class="ml-10" v-model="completed" style="width: 200px">
            <Option
              v-for="item in [
                { label: '已完成', value: 1 },
                { label: '未完成', value: 0 },
              ]"
              :value="item.value"
              :key="item.value"
              >{{ item.label }}</Option
            >
          </Select>
          <Button class="ml-10" @click="search" type="primary">查询</Button>
          <Button class="ml-10" @click="handleAdd">新增</Button>
        </div>
        <Table
          :columns="columns"
          :data="tableData"
          :row-class-name="rowClassName"
        >
          <template
            #[item.key]="{ row }"
            v-for="item in columns"
            :key="item.key"
          >
            <span
              :title="row.overTime ? '已超时' : ''"
              :class="{ bold: row.overTime, red: row.overTime }"
              v-if="['deliverTime'].includes(item.key)"
              >{{ row[item.key] }}</span
            >
            <span v-else-if="['notes', 'orderId'].includes(item.key)">{{
              row[item.key]
            }}</span>
            <Checkbox
              v-else
              v-model="row[item.key]"
              @on-change="handleCheck(row, item.key, row[item.key])"
            >
              {{ item.title }}
            </Checkbox>
          </template>
          <template #operate="{ row }">
            <a class="red ml-10" @click="handleDelete(row)">删除</a>
          </template>
        </Table>
        <div class="mt-10" style="text-align: right">
          <Page
            v-model="pageNo"
            :page-size="pageSize"
            :total="total"
            placement="top"
            :page-size-opts="[5, 10, 20, 30, 50]"
            show-elevator
            show-sizer
            @on-change="handlePage"
            @on-page-size-change="handlePageSize"
          />
        </div>
      </Content>
    </Layout>
    <Modal v-model="addModal" title="新增">
      <Form
        ref="addForm"
        :model="addForm"
        :rules="addFormRules"
        :label-width="100"
      >
        <FormItem label="单号:" prop="orderId">
          <Input type="text" v-model="addForm.orderId" placeholder="请输入单号">
          </Input>
        </FormItem>
        <FormItem label="备注:" prop="notes">
          <Input type="text" v-model="addForm.notes" placeholder="请输入备注">
          </Input>
        </FormItem>
        <FormItem label="截止时间:" prop="deliverTime">
          <DatePicker
            style="width: 100%"
            v-model="addForm.deliverTime"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            placeholder="请选择截止时间"
          />
        </FormItem>
      </Form>
      <template #footer>
        <Button @click="addCancel">取消</Button>
        <Button type="primary" @click="addOk" :loading="addLoading"
          >确定</Button
        >
      </template>
    </Modal>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import expandDetail from "./components/expandDetail.vue";

export default {
  name: "app",
  data() {
    return {
      orderId: "",
      completed: 0,
      autoFresh: true,
      columns: [
        {
          key: "orderId",
          slot: "orderId",
          title: "单号",
        },
        {
          key: "step1",
          slot: "step1",
          title: "切割",
        },
        {
          key: "step2",
          slot: "step2",
          title: "磨边",
        },
        {
          key: "step3",
          slot: "step3",
          title: "钢化",
        },
        {
          key: "step4",
          slot: "step4",
          title: "捡片",
        },
        {
          key: "step5",
          slot: "step5",
          title: "夹胶",
        },
        {
          key: "notes",
          title: "备注",
          slot: "notes",
        },
        {
          key: "deliverTime",
          title: "交付日期",
          slot: "deliverTime",
        },
        // {
        //   title: "操作",
        //   slot: "operate",
        //   width: 100,
        // },
      ],
      tableData: [
        {
          id: 1,
          orderId: "2024070801",
          step1: false,
          step2: true,
          step3: false,
          step4: false,
          step5: false,
          step6: false,
          step7: false,
          step8: false,
          step9: false,
          step10: false,
          notes: "切割要仔细点",
          deliverTime: "2024-07-15 20:14:13",
          createTime: "2024-07-08 16:14:29",
          overTime: true,
        },
        {
          id: 2,
          orderId: "2024070802",
          step1: false,
          step2: false,
          step3: false,
          step4: false,
          step5: false,
          step6: false,
          step7: false,
          step8: false,
          step9: false,
          step10: false,
          notes: "ddd",
          deliverTime: "2024-07-09 08:00:00",
          createTime: "2024-07-08 18:16:21",
          overTime: false,
        },
        {
          id: 3,
          orderId: "2024070803",
          step1: false,
          step2: false,
          step3: false,
          step4: false,
          step5: false,
          step6: false,
          step7: false,
          step8: false,
          step9: false,
          step10: false,
          notes: "ddd",
          deliverTime: "2024-07-09 08:00:00",
          createTime: "2024-07-08 18:16:21",
          overTime: false,
        },
      ],
      pageNo: 1,
      pageSize: 5,
      total: 0,
      addModal: false,
      addLoading: false,
      addForm: {
        orderId: "",
        notes: "",
        deliverTime: "",
      },
      addFormRules: {
        orderId: [
          { required: true, message: "单号不能为空", trigger: "blur" },
          { max: 100, message: "单号不能超过100字", trigger: "blur" },
        ],
        notes: [{ max: 500, message: "备注不能超过500字", trigger: "blur" }],
        deliverTime: [
          {
            required: true,
            type: "date",
            message: "截止时间不能为空",
            trigger: "change",
          },
        ],
      },
      timer: 0,
      isPhone: false,
    };
  },
  mounted() {
    this.isPhone = window.innerWidth < 800;
    this.queryTableHeaders();
    this.search();
  },
  methods: {
    queryTableHeaders() {
      axios
        .get("/api/pipeline/queryTableHeaders")
        .then((res) => {
          // res = {
          //   data: [
          //     {
          //       id: 37,
          //       columnName: "orderId",
          //       chineseName: "单号",
          //       stepOrder: 1,
          //     },
          //     {
          //       id: 38,
          //       columnName: "step1",
          //       chineseName: "切割",
          //       stepOrder: 2,
          //     },
          //     {
          //       id: 39,
          //       columnName: "step2",
          //       chineseName: "磨边",
          //       stepOrder: 3,
          //     },
          //     {
          //       id: 40,
          //       columnName: "step3",
          //       chineseName: "钢化",
          //       stepOrder: 4,
          //     },
          //     {
          //       id: 41,
          //       columnName: "step4",
          //       chineseName: "捡片",
          //       stepOrder: 5,
          //     },
          //     {
          //       id: 42,
          //       columnName: "step5",
          //       chineseName: "中空",
          //       stepOrder: 6,
          //     },
          //     {
          //       id: 43,
          //       columnName: "step6",
          //       chineseName: "夹胶",
          //       stepOrder: 7,
          //     },
          //     {
          //       id: 44,
          //       columnName: "step7",
          //       chineseName: "包装",
          //       stepOrder: 8,
          //     },
          //     {
          //       id: 45,
          //       columnName: "notes",
          //       chineseName: "备注",
          //       stepOrder: 9,
          //     },
          //     {
          //       id: 46,
          //       columnName: "deliverTime",
          //       chineseName: "交付日期",
          //       stepOrder: 10,
          //     },
          //   ],
          // };
          if (this.isPhone) {
            this.columns = [
              {
                type: "expand",
                width: 50,
                render: (h, params) =>
                  h(expandDetail, {
                    steps: res.data.filter((item) =>
                      item.columnName.includes("step")
                    ),
                    row: params.row,
                    handleCheck: (row, key, value) => {
                      this.handleCheck(row, key, value);
                    },
                  }),
              },
              {
                key: "orderId",
                slot: "orderId",
                title: "单号",
              },
              {
                key: "notes",
                title: "备注",
                slot: "notes",
              },
              {
                key: "deliverTime",
                title: "交付日期",
                slot: "deliverTime",
              },
            ];
            return;
          }
          this.columns = res.data.map((item) => ({
            title: item.chineseName,
            key: item.columnName,
            slot:
              item.columnName.includes("step") ||
              ["deliverTime", "notes", "orderId"].includes(item.columnName)
                ? item.columnName
                : null,
          }));
          this.columns.push({
            title: "操作",
            slot: "operate",
            width: 100,
          });
        })
        .catch((err) => {
          this.$Message.error("获取表头失败");
        });
    },
    handleCheck(row, key, value) {
      console.log(row, key, value);
      // 只允许选中
      axios
        .get(
          `/api/pipeline/updateStepStatus?id=${
            row.id
          }&stepName=${key}&isCompleted=${value ? 1 : 0}`
        )
        .then((res) => {
          this.$Message.success("状态修改成功");
          !this.isPhone && this.search();
        })
        .catch((err) => {
          row[key] = !row[key];
          this.$Message.error("状态修改失败");
        });
    },
    handleDelete(row) {
      axios
        .get(`/api/pipeline/deleteOrder?id=${row.id}`)
        .then((res) => {
          this.$Message.success("删除成功");
          this.search();
        })
        .catch((err) => {
          this.$Message.error("删除失败");
        });
    },
    search() {
      // 切换页码重置定时器，去抖
      if (this.timer) {
        clearTimeout(this.timer);
      }
      axios
        .get(
          `/api/pipeline/queryOrders?pageNum=${this.pageNo}&pageSize=${this.pageSize}&completed=${this.completed}&orderId=${this.orderId}`
        )
        .then((res) => {
          this.total = res.data.total || 0;
          this.tableData = res.data.list || [];
          if (this.pageNo === 1 && this.total === 0) {
            // 首页无数据，定时刷新第一页
            this.timer = setTimeout(() => {
              this.autoFresh && this.search();
            }, 10000);
          } else if (this.pageNo !== 1 && res.data.list.length === 0) {
            // 非首页但是本页无数据，回到第一页重新搜索
            this.pageNo = 1;
            this.search();
          } else {
            // 首页有数据,定时刷新下一页；
            // 或者 非首页本页有数据，也定时刷新下一页；
            this.timer = setTimeout(() => {
              if (this.autoFresh) {
                this.pageNo++;
                this.search();
              }
            }, 10000);
          }
        })
        .catch((err) => this.$Message.error("获取数据失败"));
    },
    handlePage() {
      this.search();
    },
    handlePageSize(size) {
      this.pageSize = size;
      this.handlePage(1);
    },
    handleAdd() {
      this.addForm = {
        orderId: "",
        notes: "",
        deliverTime: "",
      };
      this.$refs.addForm.resetFields();
      this.addModal = true;
    },
    addOk() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.addLoading = true;
          axios
            .post("/api/pipeline/addOrder", {
              ...this.addForm,
              deliverTime: moment(this.addForm.deliverTime).format(
                "YYYY-MM-DD HH:mm:ss"
              ),
            })
            .then((res) => {
              this.$Message.success("新增成功");
              this.search();
            })
            .catch((err) => this.$Message.error("新增失败"))
            .finally(() => {
              this.addLoading = false;
              this.addCancel();
            });
        }
      });
    },
    addCancel() {
      this.addModal = false;
    },
    rowClassName(row, index) {
      if (row.overTime) {
        return "table-overtime-row";
      }
      return "";
    },
  },
};
</script>

<style lang="less">
.w-280 {
  width: 280px;
}
.main {
  .red {
    color: rgb(238, 34, 34);
  }
  .bold {
    font-weight: bold;
  }
  .ml-10 {
    margin-left: 10px;
  }
  .layout-header,
  .layout-footer {
    color: white;
  }
  .layout-content {
    padding: 16px;
    background: #fff;
    .a-right {
      display: flex;
      justify-content: flex-end;
      padding: 0 0 8px;
    }
  }
  .ivu-checkbox-checked .ivu-checkbox-inner {
    background-color: #19be6b;
    border-color: #19be6b;
  }
  .ivu-checkbox-disabled.ivu-checkbox-checked .ivu-checkbox-inner {
    background-color: #19be6b;
    border-color: #19be6b;
  }
  .ivu-checkbox-disabled + span {
    color: #515a6e;
  }
  .ivu-checkbox-disabled.ivu-checkbox-checked .ivu-checkbox-inner:after {
    border-color: #f3f3f3;
  }
  .ivu-table thead td,
  .ivu-table thead th {
    height: 60px;
  }
  .ivu-table tbody td,
  .ivu-table tbody th {
    height: 90px;
  }
  .ivu-checkbox-inner {
    border: 2px solid orange;
  }
  .ivu-table .table-overtime-row td {
    background-color: #fadfdf;
  }
  .ivu-table .ivu-table-expanded-cell {
    padding: 10px;
  }
}
@keyframes autoFresh {
  0% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.autoFresh {
  animation: autoFresh 1.5s linear infinite;
}
</style>