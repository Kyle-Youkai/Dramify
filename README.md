# Dramify 本地网站

双击本目录中的「启动网站.command」打开网站，保持启动窗口开启。不要直接双击 index.html；浏览器可能阻止它读取 Excel。

## 修改剧集文字

编辑 content/dramas.xlsx，保存后刷新浏览器即可读取新内容。不需要生成更新包。保留 ItemNumber 与七个表头，32 条记录不能删除或重复。简介和标签填写后会显示在剧集详情页。

## 目录说明

- index.html、style.css 和各个 .js：当前网站代码。
- assets：网站使用的图片；图像资源：保留的原始图片。
- content/dramas.xlsx：剧集文字的唯一来源。
- vendor：网站运行所需的第三方库。
- supabase：数据表和数据库配置说明。
- 启动网站.command、local_server.py：本地启动入口。

以前的更新副本已移到上一级「看剧软件历史更新备份」，当前目录只维护这一套网站。

需要发布时由你自行上传网站文件。详细数据配置请参见 supabase 文件夹内的说明。

## 用户资料

注册和编辑资料均使用 Male / Female 选项、Country 与 Job 文本输入。Job 保存在本地用户资料中，云端同步到现有 behavior_events JSON 的 action=profile_snapshot 记录内的 job 字段，无需新增数据库列；它不计入剧集行为数量。
