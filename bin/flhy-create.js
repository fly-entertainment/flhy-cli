#!/usr/bin/env node

const fs = require('fs');
const program = require("commander");
const path = require("path");
const chalk = require("chalk");
const { execSync } = require('child_process');

program
  .usage("[options] -p")
  // 定义参数解析
  .option("-p, --page [page]", "生成tsx页面")
  .parse();
const options = program.opts();
const page = options.page;

// 获取当前工作目录
const cwd = process.cwd();
const isProjectRoot = fs.existsSync(path.join(cwd, 'package.json'));
if (!isProjectRoot) {
    console.log(chalk.red('请在项目根目录下执行该命令'));
    process.exit(1);
}

class PageCreator {
    constructor(page) {
        this.page = page;
        this.pageComponent = '';
        this.pageComponentKey = '';
        this.filePath = path.join(cwd, 'src', 'page', `${page}.tsx`);
        this.routerPath = path.join(cwd, 'src', 'config', 'router.ts');
        this.firstParts = '';
        this.secondeParts = '';
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    createComponentNames() {
        const parts = this.page.split('/');
        if (parts.length !== 2) {
            console.log(chalk.green(`请输入"**/**"格式`));
            process.exit(1);
        }
        this.firstParts = parts[0];
        this.secondeParts = parts[1];
        if (this.secondeParts === 'index') {
            this.pageComponent = this.capitalize(firstParts);
            this.pageComponentKey = `${firstParts.toUpperCase()}_SCREEN`;
        } else {
            const firstPartsCapitalized = this.capitalize(this.firstParts);
            const secondPartsCapitalized = this.capitalize(this.secondeParts);
            this.pageComponent = firstPartsCapitalized + secondPartsCapitalized;
            this.pageComponentKey = `${this.firstParts.toUpperCase()}_${this.secondeParts.toUpperCase()}_SCREEN`;
        }
    }

    createFile() {
        if (fs.existsSync(this.filePath)) {
            console.log(chalk.green(`文件${this.filePath}已存在`));
            process.exit(1);
        } else {
            const templatePath = path.join(__dirname, '..', 'template', 'tel.txt');
            const data = fs.readFileSync(templatePath, 'utf8');
            const repalceData = data.replace(/\$\{pageComponent\}/g, this.pageComponent).replace(/\$\{pageComponentKey\}/g, this.pageComponentKey);
            if (!fs.existsSync(path.join(cwd, 'src', 'page', this.firstParts))) {
                fs.mkdirSync(path.join(cwd, 'src', 'page', this.firstParts));
            }
            fs.writeFileSync(this.filePath, repalceData, 'utf8');
            console.log(chalk.green(`文件${this.filePath}已创建`));
            return true;
        }
    }

    updateRouterConfig() {
        let routerConfig = fs.readFileSync(this.routerPath, 'utf8');

        const importTel = `import ${this.pageComponent} from '@/page/${this.page}';`
        routerConfig = routerConfig.replace(/(\/\/ 追加页面\n)([^\n]*)/, `$1${importTel}$2`);

        const importKeyTel = `export const ${this.pageComponentKey} = '${this.pageComponent}';`;
        routerConfig = routerConfig.replace(/(\/\/ 追加页面key\n)([^\n]*)/, `$1${importKeyTel}$2`);

        const importRouterTel = `{
            name: ${this.pageComponentKey},
            component: ${this.pageComponent},
        },`;
        routerConfig = routerConfig.replace(/(\/\/ 追加router\n)([^\n]*)/, `$1${importRouterTel}$2`);

        fs.writeFileSync(this.routerPath, routerConfig, 'utf8');

        execSync(`npx prettier --write ${this.routerPath}`);
        execSync(`npx eslint --fix ${this.routerPath}`);
    }

    create() {
        this.createComponentNames();
        this.createFile();
        this.updateRouterConfig();
    }
}

const pageCreator = new PageCreator(page);
pageCreator.create();