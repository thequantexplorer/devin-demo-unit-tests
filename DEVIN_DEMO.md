# Devin demo: Add unit tests to a payments module

**What it shows:** Devin writes unit tests for a payments module that has none, gets line coverage over 90%, finds a real bug with one of the tests, and fixes it in a separate commit.

**Needs:** GitHub only

More demos: [devin-advanced-demos](https://github.com/thequantexplorer/devin-advanced-demos)

## The problem

`src/` has charge, refund and webhook signature code, and there are no tests. The coverage check fails:

```text
$ npm run coverage
# tests 0
...
Lines        : 0% ( 0/210 )
ERROR: Coverage for lines (0%) does not meet global threshold (90%)
```

There is also one bug in the code. A good test will find it.

## Set it up

1. Click **Use this template**, then **Create a new repository**. Choose your GitHub account as the owner, keep the name `devin-demo-unit-tests`, and click **Create repository**. The prompt below assumes that name.
2. In Devin, open [**Settings → Connections → GitHub**](https://app.devin.ai/settings/connections/github) and make sure Devin can access the new repository.
3. Optional: see the failing check yourself. In your copy on GitHub, open

   `https://github.com/<you>/devin-demo-unit-tests/actions/workflows/tests.yml`

   click **Run workflow**, then the green **Run workflow** button in the menu. After about 30 seconds the run has a red X. Click it, then click **test**, to see `Coverage for lines (0%) does not meet global threshold (90%)`.

## Prompt

Open [app.devin.ai](https://app.devin.ai), start a new session, and paste this. Replace `<you>` with your GitHub user.

```text
Add unit tests to the payments module in https://github.com/<you>/devin-demo-unit-tests. It has no tests today, so `npm run coverage` fails.

Use Node's built-in test runner, as the README says. Test charge, refund and the webhook signature check, including the error cases and every money and webhook rule in the README. Get line coverage above 90% (`npm run coverage` must pass).

If a test finds a bug, do not change the test to match the code. Tell me what the bug is and which test shows it. Fix it in a separate commit that comes after the commit with the tests. Open one PR with both commits, the coverage table, and a short note about the bug.
```

## What to watch

- Devin runs `npm run coverage` first and sees 0%.
- One refund test fails against the real code, and Devin explains why before it changes any code.

## You're done when

- The PR has two commits: the tests, then the bug fix.
- The **Tests** check on the PR is green, and the coverage table shows more than 90% of lines covered.
- The PR names the bug: two partial refunds could add up to more than the charge.
