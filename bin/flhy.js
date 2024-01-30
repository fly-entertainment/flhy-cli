#!/usr/bin/env node

const program = require('commander');

program
  // 版本
  .version(require("../package").version)
  // 命令映射
  .usage(
    `
  flhy create -p [page]
    `
  )
  // 描述信息
  .description(
    `Params:
    create:
    -p [page] 页面`
  )
  // 命令映射
  .command("create", "初始化Page");

// 解析命令参数
program.parse(process.argv);