---
layout: page
title: Categories page
permalink: /categories/
---

{% for category in site.categories %}
<h2 id="{{ category[0] }}-ref">{{ category[0] | join: "/" }}</h2>
<ul>
   
</ul>
{% endfor %}