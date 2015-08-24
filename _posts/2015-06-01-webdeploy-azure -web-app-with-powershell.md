---
layout: news_item
title: 'Web Deploy Azure Web App with Powershell'
date: 2015-08-21 19:00:00
author: rob
tags: [webdeploy, msdeploy, azure, powershell]
category: devops

showExcerpt: true
screenText: "<p>&#62;BUILD</p><p>&#62;DEPLOY</p><p>&#62;WIN!!</p>"
---

There are a number of ways of deploying to an azure web app, you can use ftp, integrate with github, use the azure powershell cmdlets, publish from visual studio, use a 3rd party tool like the very excellent octopus deploy or one of the many other options available. The option we have found to be the most reliable and fastest for our scenario is web deploy.

<!--more-->

Our setup is deliberately as simple as it can be, we have a teamcity server which pulls from our github hosted git repo. The build agent builds the code, runs all the C# and javascript unit tests and finally deploys to the relevant environment. Packaging and deployment are the subject of this post.

Firstly you need to build a deployable package. We do this with msbuild:

    msbuild YourProject.csproj /p:DeployOnBuild=true /p:DeployTarget=Package /m /t:rebuild /p:Configuration=Release

Once that's done take a look at `<ProjectRoot>\obj\Release\Package\PackageTmp`. This is the result of the deployment, your binaries will be in the bin folder and any web config transformations will have been applied. We now need to get this up to our azure website.

First head over to the azure portal and download a copy of the publish profile for your site, these are specific to the deployment slot, so you probably want the staging slot version. The screen shot below shows where to find file you're after.

![Portal]({{ site.url }}/assets/2015-08/portal.png)

For our environment we have one powershell script which deploys multiple different sites, so we don't want to just crack open the file and copy the values over, but rather we want to programmatically pick out the values we need. 


    [xml]$xml = Get-Content ".\Deployment\$site(staging).azurewebsites.net.PublishSettings"
    $deploySetting = $xml.SelectNodes("/publishData/publishProfile[@publishMethod='MSDeploy']") | Select-Object
    $workdingDir = Get-Location

    & 'C:\Program Files\IIS\Microsoft Web Deploy V3\msdeploy.exe' `
         "-verb:sync" `
         "-source:contentPath='$workdingDir\$packagePath'" `
         "-enableRule:offline" `
         "-dest:contentPath=wwwroot,ComputerName='https://$($deploySetting.publishUrl)/msdeploy.axd?site=$($deploySetting.msdeploySite)',UserName=$($deploySetting.userName),Password='$($deploySetting.userPWD)',AuthType='Basic'" `
         "-usechecksum" `
         "-verbose"

Running this script takes the `.PublishSettings` file, extracts the relevant details and pushed the build result up to our staging slot.

So in 6 lines of script we have a build and a deployment.