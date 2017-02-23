---
layout: news_item
title: 'VSTS to FogBugz Automation'
date: 2017-02-17 09:00:00
author: gavinwoolley
category: devops
tags: [vsts, fogbugz, automation, zapier]
showExcerpt: true
screenText: "<p>&#62;VSTS</p><p>&#62;FogBugz</p><p>&#62;Automate</p>"
---

There was a need to automatically update a FogBugz Case's based upon actions within Visual Studio Team Services (VSTS) work items.
To achieve this I am using [Zapier](https://zapier.com/) and the [FogBugz API](http://help.fogcreek.com/the-fogbugz-api) to orchestrate the process.<!--more-->
 
 
## VSTS Work Items

We have items in the HelpDesk area of VSTS and when we move items to the **"Deployable"** Column of the Kanban board we would like to **resolve** the FogBugz Case associated with it. 

![VSTS_Work]({{ site.url }}/assets/2017-02/VSTS_Work.png){:class="img-responsive"}

## Zapier Integration

In Zapier, I have setup a new **Zap** (Workflow process).
The steps of the **Zap** are as follows. 

![Zapier_Steps]({{ site.url }}/assets/2017-02/Zapier_Steps.PNG){:class="img-responsive"}

## Step 1 - Update Work Item

Using the Zapier VSTS integration, I added our **Automation User Account** in order to access VSTS.
Setup the action to **"Update Work Item"**. This will make Zapier monitor VSTS for actions on work items in the areas specified below.

![Zapier_VSTS]({{ site.url }}/assets/2017-02/Zapier_VSTS.PNG){:class="img-responsive"}

## Step 2 - Only continue if...

Because there are multiple columns on the board and I am only interested in when a work item is placed in the Deployable column, I have created a Zapier filter to query for that condition. 

![Zapier_if]({{ site.url }}/assets/2017-02/Zapier_If.PNG){:class="img-responsive"}

## Step 3 - Custom WebHook

Now that we have successfully monitored and picked up the actions from **VSTS Kanban** board, I now need to find the **FogBugz case** which references the **VSTS Work Item**. 

Using a custom Webhook in Zapier I can query the **FogBugz JSON API** for the FogBugz Case number, using the VSTS Work Item Number Ref (custom) field. 

You can see in the below image I am **POSTing** to **FogBugz API** endpoint a query, utilising the Work Item number we collected in **Step 1** from the action on **Kanban board**. 

![Zapier_FogBugz_JSON]({{ site.url }}/assets/2017-02/Zapier_FogBugz_Json.PNG){:class="img-responsive"}

## Step 4 - Post to FogBugz to Resolve Case

After the above step completed successfully I now have the FogBugz case number in question, this will allow me to **POST** another command to the API to resolve the Case. 

You can see in the below image I am **POSTing** to **FogBugz API** endpoint a query, utilising the Work Item number we collected in **Step 3**.
This uses the API cmd **resolve**

![Zapier_FogBugz_Resolve]({{ site.url }}/assets/2017-02/Zapier_Resolve_Case.png){:class="img-responsive"}

## Seeing it all in action

Right so now i have put all the pieces together.

In FogBugz I have the following two cases open assigned to me, with the VSTS Ref field filled in. 

![Open_FogBugz_Cases]({{ site.url }}/assets/2017-02/Open_FogBugz_cases.jpg){:class="img-responsive"}


* In VSTS we have the work items that match these cases


![VSTS_Work]({{ site.url }}/assets/2017-02/VSTS_Work.png){:class="img-responsive"}

* Now if I move the case into the **Deployable** Column, Zapier will pick up the action and resolve the case. 

![VSTS_complete]({{ site.url }}/assets/2017-02/VSTS_Complete.PNG){:class="img-responsive"}

* Check Zapier History. There are two successful tasks ran. 

![Zapier_History]({{ site.url }}/assets/2017-02/Zapier_History.PNG){:class="img-responsive"}

* If i expand the tasks, you can see each action. 

![Zapier_Success]({{ site.url }}/assets/2017-02/Zapier_Task_Success.PNG){:class="img-responsive"}

* Lets check FogBugz now. 

![FogBugz_Resolved]({{ site.url }}/assets/2017-02/FogBugz_Resolved.PNG){:class="img-responsive"}

* And both cases are now marked as **Resolved**

