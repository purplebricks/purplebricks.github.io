---
layout: page2
title: Hello World!
tagline: Supporting tagline
---
{% include JB/setup %}

## Update Author Attributes

In `_config.yml` remember to specify your own data:

    title : My Blog =)

    author :
      name : Name Lastname
      email : blah@email.test
      github : username
      twitter : username

The theme should reference these variables whenever needed.

## Sample Posts

This blog contains sample posts which help stage pages and blog data.
When you don't need the samples anymore just delete the `_posts/core-samples` folder.

    $ rm -rf _posts/core-samples