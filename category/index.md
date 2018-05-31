---
layout: default
title: 'Articles by category'
permalink: /category/
---

{% assign sortedcats = site.categories | sort %}

<div class="categoriesList">
    <h2>Categories:</h2>
    <ul>
        {% for category in sortedcats %}
            <li><a href="/category/{{ category | first }}">{{ category | first }}</a></li>
        {% endfor %}
    </ul>
</div>