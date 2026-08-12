console.table(
    accounts.map(account => {

        const g =
            buildAccountGuidance(
                account
            );

        return {
            account:
                g.accountName,

            goal:
                g.accountGoal,

            goalHeadline:
                g.accountGoalHeadline,

            today:
                g.todayAction,

            todayReason:
                g.todayReason,

            riskMode:
                g.riskMode,

            target:
                g.targetToday,

            stop:
                g.maxLossToday
        };

    })
);
