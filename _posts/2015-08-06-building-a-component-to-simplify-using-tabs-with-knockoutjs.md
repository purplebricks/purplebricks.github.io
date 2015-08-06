---
layout: news_item
title: 'Building a component to simplify using tabs with KnockoutJS'
date: 2015-08-06 09:00:00
author: banford
category: programming
tags: [javascript, knockout, frontend]
showExcerpt: true
---

Tabs are a common tool used to split up user interfaces on the web. They usually represent to the user that you're working within the same section of a page but that there are multiple options for you there that don't warrant splitting of into full pages of their own.<!--more-->

The standard path for using tabs in a knockout page would probably be to add some HTML markup for the tabs first. This would usually be a set of links, maybe in a list and some containers with tab content in them. A knockout viewmodel can then be used to bind data to the tab content containers and also bind click functions and visible functions to show and hide the tabs when the user interacts with the links.

This is fine if the content within each tab panel is simple. The state of the selected tab and all the data being bound to the containers could live in the view model for the page. But this would violate the Single Responsibility Principle as we have one viewmodel with several responsibilities.

The first step to refactor this would be to give each tab its own child viewmodel and deal with the bindings for each tab in those viewmodels. This would be a good first step but we still have state in our parent viewmodel that deals with tracking which tab is active. Another issue is that in order to apply the bindings for each tab as it becomes active we would have to wrap the tab containers in an if binding, to state that the binding should only take place if that tab is the active tab.

Again in simple cases this would be an ok solution. But in order to increase the maintainability and flexibility of the code it might be more useful to take advantage of one of the newer features of knockout, components.

## Problems I wanted to solve

- Repeated markup when using tabs in multiple places that might differ
- Tab state being stored along with application data in our viewmodels
- Only loading tab content when it is needed
- Ease of use and flexibility when adding tabs to a page

### Repeated markup

To solve the problem of repeated markup templates can be used. Knockout has had templates for a while but with components it means we can use custom elements and make our markup much more readable when wanting to use a template. For example:

Instead of:

{% highlight html linenos=table %}
<ul class="nav nav-tabs">
    <!-- Tab Links -->
</ul>

<tabs>
    <!-- Tab Links -->
</tabs>
{% endhighlight %}

That might not seem like a great win initially, but consider that you had used tabs in 5 places. If bootstrap changed the way tabs were marked up or you switch to another ui library you could easily adjust your template and all your usages would use the correct template.

Also consider that each tab panel and each tab link requires markup. By encapsulating each tab as a component and nesting them within the tabs component the markup is even more readable than the alternative.

Instead of:

{% highlight html linenos=table %}
<div>
    <!-- Nav tabs -->
    <ul class="nav nav-tabs" role="tablist">
        <li role="presentation" class="active">
            <a href="#home" aria-controls="home" role="tab" data-toggle="tab">Home</a>
        </li>
        <li role="presentation">
            <a href="#profile" aria-controls="profile" role="tab" data-toggle="tab">Profile</a>
        </li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
        <div role="tabpanel" class="tab-pane active" id="home">...</div>
        <div role="tabpanel" class="tab-pane" id="profile">...</div>
    </div>
</div>
{% endhighlight %}

You would have something like:

{% highlight html linenos=table %}
<tabs>
    <!-- ko component: { name: 'tab', params: { key: 'basic', label: 'Basic' } } --><!-- /ko -->
    <!-- ko component: { name: 'tab', params: { key: 'address', label: 'Address' } } --><!-- /ko -->
<tabs>
{% endhighlight %}

*Note: The comment style binding for the tabs is used so that they don't have a container element. This is to retain the ul > li heirarchy in the list of tab links.*

### Tab state

By using a component only the viewmodel of that component need to know about the state of the tabs.

{% highlight javascript linenos=table %}
viewModel: function(params) {
    this.selectedTabKey = ko.observable('basic');

    this.selectedTabComponentName = ko.computed(function(){
        if(this.selectedTabKey() === undefined) return 'empty-tab-content';
        return this.selectedTabKey() + '-tab-content';
        }, this)

        // Behaviours
        this.getTabClass = function(key) {
            if(key === undefined) return 'disabled';
            return this.selectedTabKey() === key ? 'active' : '';
        };

        this.switchToTab = function(key) {
            if(!key) return false;
            this.selectedTabKey(key);
        }
    }
{% endhighlight %}

### Dynamic loading

The knockout component loader will initialize each tab pane component when it is bound. So when we switch tabs the viewmodel for that component will be constructed. We can use this to add some initialization code to the tab pane viewmodel and do something like call a service to get the data for that tab.

### Ease of use

Ease of use is important especially in larger software teams. If you can provide code to other members of the team with minimal usage example and some basic documentation it's much better than handing them some markup and expecting them to figure it out.

With the component created, adding tabs becomes a three step process:

- Reference the component script file
- Use the custom elements in your markup with a child node for each tab you want
- Create a component for each of your tab content panels with the name ending 'tab-pane'

The component takes care of wiring up the click events for the tabs and switching the components over when you switch tabs.

### Advantages of the component

- The component can be demonstrated and tested in isolation.
- Separate documentation for the component can be created.
- The component can be easily packaged into a distributable format such as a bower package.
- The code could be open sourced as it's not coupled to business logic.

### Drawbacks of this component

- It's somewhat coupled to being used with bootstrap because of the classes that are used to style the tabs. For example 'nav-tabs'.
    - That could instead be made configurable, or make the templates separate from the lib to allow different tab markup.
- The comment syntax for binding the child tabs is somewhat messy.
- Requires the absolute latest version of KnockoutJS as it uses features that were only introduced in 3.3.

### Next Steps

Going forward with this component I would like to:

- Test all the functionality in the viewmodels
- Use TypeScript
- Create a bower package from it

## Summary

In summary there is definitely some additional work up front when choosing to build a component for a common UI pattern with knockout. However with the advantages it brings it is definitely something you should consider if the component is likely to be used multiple times and by multiple people.

Components are a relatively new feature to the Knockout library and they are not quite as refined as in component based libraries such as ReactJS. Despite the syntax being a little more verbose you can still achieve similar results in terms of application architecture.

**The final component code for this is [available on GitHub](https://github.com/Banford/ko-non-routed-tabs).**

