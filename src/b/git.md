# Git

## 基础命令

```bash
git config --global user.name yukino161043261 &&              \
git config --global user.email 'yukino161043261@gmail.com' && \
git config --global core.autocrlf false &&                    \
git config --global credential.helper store &&                \
git config --global init.defaultBranch main &&                \
git config --global core.filemode false

ssh-keygen -t rsa -C 'yukino161043261@gmail.com'
```

```bash
git init                         # 初始化空 git 仓库
git status                       # 查看 git 状态
git add <filename>               # 将工作区的文件添加到暂存区
git rm -r --cached <filename>    # 删除暂存区的文件
git commit -m <message> [<file>] # 将暂存区的文件提交到本地库
git log                          # 查看 git 日志
```

## submodule

```bash
git submodule add <submodule_url>
git clone <mainmodule_url> --recurse-submodules
git submodule init
git submodule update
git submodule update --init --recursive
```

## 搭建本机 git 服务器

```bash
sudo adduser git          # 添加 git 用户
sudo usermod -aG sudo git # 将 git 用户添加到 sudo 组
sudo passwd git           # 更新 git 用户的密码
sudo userdel -r git       # 删除 git 用户

su git
cd
git init --bare repo-name.git

su user
cd /path/to/repo-name
git add .
git commit -m 'Initial commit' # ./build.sh
git remote add origin ssh://git@localhost/home/git/repo-name.git
git push origin main --set-upstream
```

## branch (learnGitBranch)

```bash
# 查看本地分支
git branch
# 在 HEAD 指向的 commitHash 处创建本地分支
git branch bugfix
# 在指定的 commitHash 处创建本地分支
git branch bugfix <commitHash>
# 删除本地分支
git branch -d bugfix # -D 强制删除
# 切换到本地分支
git switch bugfix # git checkout bugfix

# 查看远程分支
git branch -r
# 创建并切换到本地分支
git branch bugfix && git switch bugfix
# 等价于
git checkout -b bugfix
# 将本地分支推送到远程仓库, 以创建远程分支
git push origin bugfix
# 删除远程分支
git push origin --delete bugfix

# 查看本地分支和远程分支
git branch -a
```

## merge

```bash
git merge <mergedBranch>

#! git checkout main && git merge bugfix
# bugfix   main*
#  |        |
#  *------ main*

#! git checkout bugfix && git merge main
# bugfix*   main
#  |         |
# bugfix* ---*
```

## rebase

```bash
git rebase <baseBranch>
git rebase <baseBranch> <targetBranch>
#! git checkout bugfix && git rebase main
# bugfix*    main
#             |
#            bugfix*

#! git rebase bugfix main
#            bugfix, main*

```

## HEAD

- branch: branch 是指向的 commitHash 的别名
- 未 detach 的 HEAD (HEAD 等于某个 branch): HEAD 是指向的 branch 的别名 (C++ 指向 commitHash 的二级指针)
- detach 的 HEAD (HEAD 不等于任何一个 branch): HEAD 是指向的 commitHash 的别名 (C++ 指向 commitHash 的一级指针)

```bash
cat .git/HEAD # ref: refs/heads/main
git symbolic-ref HEAD # refs/heads/main
```

分离 HEAD

```bash
git checkout main^ # git checkout main~1
git checkout main^^ # git checkout main~2
git checkout HEAD^ # git checkout HEAD~1
git checkout HEAD^^ # git checkout HEAD~2
# 强制移动 main 分支
git branch -f main [main^ | main~1  | HEAD^ | HEAD~1 | <commitHash>]
```

## reset & revert

```bash
git reset <ref> # 未 push, 撤销提交
git revert HEAD # 已 push, 创建一个新提交`  以撤销提交
```

## cherry-pick

将一些提交复制到 HEAD (当前 branch 或 commitHash) 下

```bash
git cherry-pick <commitHash1> <commitHash2>...
```

## 交互式 rebase

交互式 rebase: `--interactive`, 简写为 `-i`

```bash
git rebase HEAD~5 --interactive
# 合并前 5 个提交为 1 个提交后, 推送本地 main 分支到远程 main 分支
git push origin main --force-with-lease
```

`git commit --amend` 修改提交的 message

## tag

tag 也是别名

```bash
# 创建一个指向 HEAD 的标签, 表示 v1.0.0 版本
git tag v1.0.0
# 创建一个指向 commitHash 的标签, 表示 v1.0.0 版本
git tag v1.0.0 <commitHash>

git describe <ref>
# <ref> 可以是 HEAD, branchName, commitHash, tagName 等
# 输出 <tag>_<numCommits>_g<hash>
# tag: 距离 ref 最近的标签名
# numCommits: ref 比 tag 多 numCommits 个提交
# hash: ref 所在的 commitHash 的前缀
```

## 多个 parent 节点

```bash
# 第一个 parent 节点 -> 第二个 parent 节点 -> grandparent 节点
git checkout HEAD~ && git checkout HEAD^2 && git checkout HEAD~2
# 等价于
git checkout HEAD~^2~2
```

## fetch

1. 从远程仓库中下载本地仓库中缺少的 commit 记录
2. 更新远程 origin/main 分支 (不要 checkout/switch 到 origin/\* 分支上!!!)
3. 不会更新本地 main 分支, 即不会修改本地文件

`git fetch && git merge origin/main` 等价于 `git pull`

## push

### fetch + rebase + push

`git fetch && git rebase origin/main && git push` 等价于 `git pull --rebase && git push`

### fetch + merge + push

`git fetch && git merge origin/main && git push` 等价于 `git pull && git push`

## 本地分支跟踪 (track) 远程分支

默认本地 main 分支跟踪远程 main 分支

```bash
# 创建并切换到跟踪远程 main 分支的新分支 anotherMain
git checkout -b anotherMain origin/main
# branch 'anotherMain' set up to track 'origin/main'

#! 等价于
# 创建新分支 anotherMain
git branch anotherMain
# 切换到新分支 anotherMain
git switch anotherMain
# 新分支 anotherMain 跟踪远程 main 分支
git branch -u origin/main
# branch 'anotherMain' set up to track 'origin/main'

#! 等价于
# 创建新分支 anotherMain
git branch anotherMain
# 新分支 anotherMain 跟踪远程 main 分支
git branch -u origin/main anotherMain
# branch 'anotherMain' set up to track 'origin/main'
```

## push 参数

`git push <remote> <branchName>`, 例如 `git push origin main`

推送本地 main 分支到远程 main 分支 (默认是 HEAD 指向的分支)

`git push <remote> <localRef>:<remoteBranchName>`

localRef 可以是 HEAD, branchName, commitHash, tagName 等, 例如 `git push origin foo^:main`

## fetch 参数

`git fetch <remote> <branchName>`, 例如 `git fetch origin main`

从远程仓库中下载本地仓库中缺少的 commit 记录, 并更新远程 main 分支

`git fetch <remote> <remoteRef>:<localBranchName>`

remoteRef 可以是 HEAD, branchName, commitHash, tagName 等, 例如 `git fetch origin HEAD^:main`

如果只是 `git fetch`, 则将更新所有 origin/tagName 分支

## 没有 localRef 的 push, 没有 remoteRef 的 fetch

- `git push <remote> :<remoteBranchName>`, 例如 `git fetch origin :bugfix`, 删除远程 bugfix 分支
- `git fetch <remote> :<localBranchName>`, 例如 `git fetch origin :bugfix`, 新建本地 bugfix 分支
- `git push origin --delete bugfix` 删除远程 bugfix 分支
- `git branch -d bugfix` 删除本地 bugfix 分支

## pull 的参数

`git pull <remote> <remoteRef>:<localBranchName>`

等价于 `git fetch <remote> <remoteRef>:<localBranchName> && git merge <localBranchName>`

## git tag

```bash
# 创建 tag
git tag v0.0.1
# 推送 tag
git push origin v0.0.1
git push mirror v0.0.1
# 删除远程分支
git push origin --delete gh-pages
git push mirror --delete gh-pages
# 删除远程 tag
git push origin :refs/tags/v0.0.1
git push mirror :refs/tags/v0.0.1
```
