---
layout: news_item
title: 'Octopus Deploy - Azure AD Integration'
date: 2017-02-21 09:00:00
author: gavinwoolley
category: devops
tags: [octopus, azure, integration]
showExcerpt: true
screenText: "<p>&#62;Octopus</p><p>&#62;AAD</p><p>&#62;Integration</p>"
---

With the release of Octopus 3.5 you can now utilise Azure AD authentication.
This document is an overview of how I have implemented this.<!--more-->

## Azure AD Application

In order for AAD SSO to work, I need an Azure Application created to set up the trust to Octopus.

I already have an Azure Application for **Octopus Deploy Service Principal**. This is currently used as the **Service Principal** to allow Octopus to perform operations on our Azure subscription.

## Configuring Trusted Reply URLs

During the authentication with Azure AD, the user will be directed to an Azure page to enter their credentials. As part of the authentication flow, **Octopus** passes a **Reply URL** to tell Azure where to **POST** the user's security token. This URL must be added to a trusted **whitelist** in the App configuration or the authentication flow will be terminated by Azure.

In **New Azure Portal, Active Directory, App Registrations, Settings, Reply URLs**, I have added a Reply URL of https://your-octopus-server/api/users/authenticatedToken/AzureAD

##### Reply URLs are case-sensitive

Please take care when adding this URL! They are case-sensitive and can be sensitive to trailing slash characters

## Mapping AAD Users into Octopus Teams - Create AAD AppRole

In order to manage user/team membership via AAD, I have had to configure some **Roles** for the App.
To add the Roles I have had to edit the App's manifest.

In the [**New Azure Portal**](https://portal.azure.com/), go to **Active Directory**, **App Registrations**, find the **App** you want and select it, click the **Manifest** button at the top.

![Octopus_Service_Prinicipal](/assets/2017-02/Octopus_Service_Principal.png){:class="img-responsive"}

This is what I have added into the **Application Manifest** for the **Octopus App**.
I have defined 3 x **AppRoles** in the Azure App.

* Octopus Developers
* Octopus Testers
* Octopus Administrators

The **ID** value is just a random **GUID** that i generated with Powershell ** *New-Guid* ** command.
The property **Value** is what will be used to add to **Octopus Teams**  in order to manage access via **AAD Roles** and **AAD Security Groups**.

{% highlight json linenos=table %}
"appRoles": [
    {
      "allowedMemberTypes": [
        "User"
      ],
      "displayName": "Octopus Developers",
      "id": "b6823cbd-c039-4ad2-9710-983410123805",
      "isEnabled": true,
      "description": "Octopus Developers",
      "value": "octopusDevelopers"
    },
    {
      "allowedMemberTypes": [
        "User"
      ],
      "displayName": "Octopus Testers",
      "id": "f478fd68-28ab-43c5-9da4-540811af50f8",
      "isEnabled": true,
      "description": "Octopus Testers",
      "value": "octopusTesters"
    },
    {
      "allowedMemberTypes": [
        "User"
      ],
      "displayName": "Octopus Admins",
      "id": "e6b7af46-ecff-497c-8181-59a792d559c1",
      "isEnabled": true,
      "description": "Octopus Administrators",
      "value": "octopusAdmins"
    }
  ],
{% endhighlight %}

## Creating Azure AD Security Groups

The **AppRoles** we have just defined do nothing currently and should be assigned to **Azure AD Security Groups** to give us a central place to administer access into the App.
All of the **Team** members should be placed in the relevant **Security Groups** when access is needed and removed from the group when no longer required. 

Creating the groups is done in **Active Directory** in the **New Azure Portal**.

In **New Azure Portal**, **Active Directory**, **Users and Groups**, **All Groups**, **Add**.

Create the required groups, following the naming convention of existing groups and ensuring there is a meaningful description used also. 

![Octopus_Settings](/assets/2017-02/Ocotpus_Settings.PNG){:class="img-responsive"}

I have created 3 x **AAD Security Groups**, each one will be associated with the **AppRoles** and **Octopus Teams**.

  * Octopus Developers
  * Octopus Testers
  * Octopus Administrators 

## Assigning Security Groups to App

Now that we have defined the **AppRoles** and created the **Security Groups**. We can now start assigning **Azure AD Security Groups** to these **Roles**.
In **New Azure Portal**, **Active Directory**, **Enterprise Applications**, select the **App** **"Octopus Deploy Service Principal"**, select **Properties**.
Turn on **"User Assignment Required"**.

![Octopus_User_Assignment](/assets/2017-02/Octopus_User_Assignment.PNG){:class="img-responsive"}

<div class="alert alert-info">
  <strong>Info!:</strong> 
  <p>
  This option being set to Yes ensure's that <strong>NO Users</strong> can access the App unless the Users are Assigned to the App or a member of a Group which has been Assigned to the App. 
  </p>
</div>

Now to assign those **Security Groups** we created to the **App**.
Go to the **User and Groups** setting of the **App**, click **Add**.
Browse to the **Group** you just created and **Select** it. 
Browse to the **AppRole** you want to associate with the **Group** and **Select** it.
Do this for all the **AppRoles** and **Groups** you have created. 

![Octopus_Roles](/assets/2017-02/Octopus_Roles.PNG){:class="img-responsive"}

<div class="alert alert-info">
  <strong>Info!:</strong> 
  <p>
  No Users should be added here. Only Security Group membership should be used for Application Access
  </p>
</div>

## Assigning AAD App Roles to Octopus Teams

Now we have created the **AppRoles** and **Security Groups**, they have been assigned to the App to allow access. When they get passed through to **Octopus** we need to assign those **AppRoles** to a **Team** in **Octopus**, so it knows what permissions the **Users** in the **Security Groups** will receive in **Octopus**.

Log in to Octopus Deploy Server and go to **Configuration**, **Teams** [https://your-octopus-server/app#/configuration/teams](https://your-octopus-server/app#/configuration/teams)
We already have 3 x **Teams** that match that match the **AppRoles** and **Security Groups** I created earlier.
Go into the **Team**, click **Add External Role** at the bottom.
Using the **Value** you defined in the **Manifest** file earlier as the **Role ID**, give it a meaningful **Display Name** following the existing convention, then click **Add**. 
Do this same procedure for the other **Teams** in **Octopus**

![Octopus_Teams_2](/assets/2017-02/Octopus_Roles2.PNG){:class="img-responsive"}

## Configuring Octopus Deploy to use AAD Auth Provider

The **Octopus Server** now needs to be told to use the **AAD Auth Provider**. 
By default **Octopus** uses its built-in User Database only. 

Octopus now supports the following Auth Providers 
  * Internal Username / Password
  * On-Prem Active Directory
  * Azure AD
  * Google Apps

These can be changed at the **CMD Line** on the **Octopus Server** 

In order to set **AAD** as the **Auth Provider** there are two values we need from the **Azure Portal**. The **Client ID** and **Issuer**. 

## Client ID / Application ID

In **New Azure Portal**, **Active Directory**, **Enterprise Applications**, select the **App** **"Octopus Deploy Service Principal"**, select **Properties**.

The **Application ID** is the **Client ID**

![Octopus_Client_ID](/assets/2017-02/Octopus_Client_ID.png){:class="img-responsive"}

## Issuer ID

In **New Azure Portal**, **Active Directory**, **App Registrations**, **Endpoints**.

![Endpoints](/assets/2017-02/Endpoints.png){:class="img-responsive"}

Copy the **OAuth 2.0 Authorization Endpoint** and delete the **/oauth2/authorize** section from the end of the **URL**

## Setting the Client ID and Issuer in Octopus 

Once you have those values, run the following from a command prompt in the folder where we have installed Octopus Server **"C:\Program Files\Octopus Deploy\Octopus"**
This will enable **Azure AD** as an **Auth Provider** and configure the required parameters. 

{% highlight bat linenos=table %}
Octopus.Server.exe configure --azureADIsEnabled=true --azureADIssuer=https://login.microsoftonline.com/12345678-abcdef-1234-abcdefghij --azureADClientId=abcdefhij-123456-abcdef-1234
{% endhighlight %}

## Setting up Single Sign on

* I have disabled the internal user database of octopus using the following command. 

{% highlight bat linenos=table %}
Octopus.Server.exe configure --usernamePasswordIsEnabled=false
{% endhighlight %}

* Then to configure SSO, i have ran the following command. 

{% highlight bat linenos=table %}
Octopus.Server.exe configure --autoLoginEnabled=true
{% endhighlight %}

If you now logout of Octopus.
You will now be automatically signed in with your Azure AD credentials

![Octo_Signin](/assets/2017-02/octo2.png){:class="img-responsive"}