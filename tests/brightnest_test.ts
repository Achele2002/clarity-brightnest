import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can create new habit",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("brightnest", "create-habit", 
        [types.ascii("Exercise daily")], 
        wallet_1.address
      )
    ]);
    
    assertEquals(block.receipts[0].result.expectOk(), "u1");
  },
});

Clarinet.test({
  name: "Can complete habit and earn points",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("brightnest", "create-habit",
        [types.ascii("Exercise daily")],
        wallet_1.address
      ),
      Tx.contractCall("brightnest", "complete-habit",
        [types.uint(1)],
        wallet_1.address
      )
    ]);
    
    assertEquals(block.receipts[1].result.expectOk(), true);
    
    let pointsResult = chain.callReadOnlyFn(
      "brightnest",
      "get-points-balance",
      [types.principal(wallet_1.address)],
      wallet_1.address
    );
    
    assertEquals(pointsResult.result.expectOk(), "u10");
  },
});

Clarinet.test({
  name: "Cannot complete same habit twice in one day",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("brightnest", "create-habit",
        [types.ascii("Exercise daily")],
        wallet_1.address
      ),
      Tx.contractCall("brightnest", "complete-habit",
        [types.uint(1)],
        wallet_1.address
      ),
      Tx.contractCall("brightnest", "complete-habit",
        [types.uint(1)],
        wallet_1.address
      )
    ]);
    
    assertEquals(block.receipts[2].result.expectErr(), "u400");
  },
});

Clarinet.test({
  name: "Streak resets when habit is not completed daily",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet_1 = accounts.get("wallet_1")!;
    
    let block = chain.mineBlock([
      Tx.contractCall("brightnest", "create-habit",
        [types.ascii("Exercise daily")],
        wallet_1.address
      ),
      Tx.contractCall("brightnest", "complete-habit",
        [types.uint(1)],
        wallet_1.address
      )
    ]);

    // Simulate passing of 2 days by mining 288 blocks (144 blocks per day)
    chain.mineEmptyBlockUntil(chain.blockHeight + 288);
    
    block = chain.mineBlock([
      Tx.contractCall("brightnest", "complete-habit",
        [types.uint(1)],
        wallet_1.address
      )
    ]);

    let streakResult = chain.callReadOnlyFn(
      "brightnest",
      "get-streak",
      [types.uint(1)],
      wallet_1.address
    );
    
    // Verify streak was reset to 1
    assertEquals(
      (streakResult.result.expectSome() as any)['current-streak'],
      "u1"
    );
  },
});
