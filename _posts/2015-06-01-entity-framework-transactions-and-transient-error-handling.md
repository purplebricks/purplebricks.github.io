---
layout: news_item
title: 'Entity Framework Transactions and Transient Error Handling'
date: 2015-05-01 14:00:00
author: rob
tags : [entityframework, transactions, transient errors]
categories: [entityframework]
---

<!--
    showExcerpt: true
    postThumb: 'https://az713861.vo.msecnd.net/web-images/marketingWebsite/global/siteCore@1x-p8-2.png'
-->

In any networked environment transient errors are to be expected. It doesn't matter how good your infrastructure is, sometimes life happens. Enter the [Transient Fault Handling Application Block](https://msdn.microsoft.com/en-us/library/hh680934%28v=pandp.50%29.aspx), the block gives developers a simple way of handling transient errors, network blips, timeout errors and the like, it's very simple to use and should be used in more often.
<!--more-->
Here at [purplebricks.com](https://www.purplebricks.com) we run our websites on Azure and we use Azure SQL databases. Helpfully there is a specific execution strategy which we can use out of the box, the `SqlAzureExecutionStrategy` is pretty much as you'd expect, that is until you want to use an explicit transaction. Support for explicit transactions with the strategy have not been implemented, but it is something we want to use. To that end we rolled our own helper. The helper has to perform a couple of simple tasks:

 1. Disable the standard execution strategy.
   - If you don't then the Entity Framework strategy will blow up.
 2. Create a strategy instance.
 3. Use the strategy to execute an arbitrary action in a transaction scope.
 4. Dispose of the transaction, but do not complete, that is not our responsibility.

So before I show you the code, it's probably worth showing how the code is used:

{% highlight c# lineos %}
    var result = await Transaction.RunTransactionAsync(async scope =>
    {
        await SomeTransationalCall();
        scope.Complete();
        return "Some Meaningful Result";
    });
{% endhighlight %}

This allows a developer request a given action is executed in a transaction and take advantage of the error handling block. If the code succeeds then we can complete the scope and return any relevant data.

To achieve this is actually pretty simple:
{% highlight c# lineos %}
    public static async Task<T> RunTransactionAsync<T>(Func<TransactionScope, Task<T>> action, CancellationToken token = new CancellationToken())
    {
        try
        {
            EfConfiguration.EnableExecutionStrategy = false;
            var executionStrategy = new SqlAzureExecutionStrategy();
            return await executionStrategy.ExecuteAsync(async () =>
            {
                var transactionOptions = new TransactionOptions 
                {
                    IsolationLevel = IsolationLevel.ReadCommitted 
                };
    
                using (var scope = new TransactionScope(TransactionScopeOption.Required,
                                                        transactionOptions,
                                                        TransactionScopeAsyncFlowOption.Enabled))
                {
                    return await action(scope);
                }
            }, token);
        }
        finally
        {
            EfConfiguration.EnableExecutionStrategy = true;
        }
    }
{% endhighlight %}
We now have the best of both worlds, we can have our explicit transactions and we can have transient error handling. Win!
