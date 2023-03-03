import { Worker, NearAccount } from "near-workspaces";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{
  worker: Worker;
  accounts: Record<string, NearAccount>;
}>;

test.beforeEach(async (t) => {
  // Init the worker and start a Sandbox server
  const worker = await Worker.init();

  // Deploy contract
  const root = worker.rootAccount;
  const contract = await root.createSubAccount("test-account");
  const alice = await root.createSubAccount("alice");
  const bob = await root.createSubAccount("bob");
  // Get wasm file path from package.json test script in folder above
  await contract.deploy(process.argv[2]);

  // Save state for test runs, it is unique for each test
  t.context.worker = worker;
  t.context.accounts = { root, contract, bob, alice };
  root.call(contract, "init", { owner_id: root.accountId });
});

test.afterEach.always(async (t) => {
  // Stop Sandbox server
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to stop the Sandbox:", error);
  });
});

test("Init contract", async (t) => {
  const { contract } = t.context.accounts;
  const total = await contract.view("get_total_kyc_supply", {});
  t.is(total, 1);
});

test("Init fee", async (t) => {
  const { contract } = t.context.accounts;
  const fee = await contract.view("get_fee", {});
  t.is(fee, "2");
});

test("Call set operator", async (t) => {
  const { root, contract, alice } = t.context.accounts;
  const res = await root.callRaw(contract, "set_operator", {
    operator_address: alice.accountId,
    value: true,
  });
  //@ts-ignore
  t.is(res.result.status.SuccessValue, "");
});

test("Call approve bob", async (t) => {
  const { root, contract, alice, bob } = t.context.accounts;

  const identifyId = "testId";
  await root.callRaw(contract, "set_operator", {
    operator_address: alice.accountId,
    value: true,
  });
  await alice.callRaw(contract, "approved_kyc", {
    address: bob.accountId,
    identifyId,
  });

  const checkKyc: any = await bob.call(contract, "get_my_kyc", {});
  t.is(checkKyc.identifyId, identifyId);
  t.is(checkKyc.isBlocked, false);
});
