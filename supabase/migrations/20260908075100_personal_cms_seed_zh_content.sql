update public.pages set summary = case slug
  when 'home' then '一个持续变化的个人空间：研究、项目、照片、音乐，以及正在发生的生活。'
  when 'now' then '最近正在做什么、学什么、想什么。'
  when 'research' then '关于 AI、群体智能、分布式系统，以及还没有被完全回答的问题。'
  when 'projects' then '把想法变成可以运行的系统，从无人机到工具，从硬件到软件。'
  when 'notes' then '技术笔记、学习记录、想法和一些不一定成熟的思考。'
  when 'photos' then '沿途的风景、城市、天气，以及一些值得留下的瞬间。'
  when 'music' then '最近在听的歌、歌单，以及旋律里另一种秩序。'
  when 'about' then '关于我、正在形成的兴趣，以及为什么想把这些东西留在这里。'
  else summary end
where slug in ('home','now','research','projects','notes','photos','music','about');
