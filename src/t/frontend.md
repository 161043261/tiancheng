# frontend

## vscode 常用正则

```bash
//(?!.*\..*\.).*\n  # //
/\*(.|\r\n|\n)*?\*/ # /**/
^\s*(?=\r?$)\n      # blank line
^(\s*)#.*           # #
```

## 导出 vscode 插件

```bash
code --list-extensions
code --list-extensions | xargs -n 1 echo code --install-extension
```
