// Find all our documentation at https://docs.near.org
import {
  NearBindgen,
  near,
  call,
  view,
  LookupMap,
  initialize,
  assert,
  NearPromise,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";

class Kyc {
  kycId: string;
  identifyId: string;
  isBlocked: boolean;
  constructor(payload: any) {
    this.kycId = payload.token_id;
    this.identifyId = payload.identifyId;
    this.isBlocked = payload.isBlocked;
  }
}

@NearBindgen({})
class ZkBlueTIck {
  addressToKycAddress: LookupMap<string>;
  addressToKyc: LookupMap<any>;
  kyc_current_index: number;
  owner_id: string;
  fee: bigint;
  receiver_fee: string;
  operators: LookupMap<boolean>;
  constructor() {
    this.owner_id = "";
    this.receiver_fee = "";
    this.addressToKyc = new LookupMap("kyc");
    this.kyc_current_index = 1;
    this.fee = BigInt(2);
    this.addressToKycAddress = new LookupMap("addressToKycAddress");
    this.operators = new LookupMap("operators");
  }

  @initialize({})
  init({ owner_id }: { owner_id: AccountId }) {
    this.owner_id = owner_id;
    this.addressToKycAddress = new LookupMap("addressToKycAddress");
    this.kyc_current_index = 1;
    this.addressToKyc = new LookupMap("addressToKyc");
    this.operators = new LookupMap("operators");
  }

  @call({})
  set_operator({
    operator_address,
    value,
  }: {
    operator_address: string;
    value: boolean;
  }) {
    this.checkOwner(near.predecessorAccountId());
    this.operators.set(operator_address, value);
  }

  @call({})
  set_receiver_fee({ address }: { address: string }) {
    this.checkOwner(near.predecessorAccountId());
    assert(this.receiver_fee !== address, `Already set`);
    this.receiver_fee = address;
  }

  @call({})
  set_fee({ new_fee }: { new_fee: bigint }) {
    this.checkOwner(near.predecessorAccountId());
    assert(new_fee > BigInt(0), `Require fee`);
    assert(this.fee !== new_fee, `Already set`);
    this.fee = new_fee;
  }

  checkOwner(address: string) {
    assert(address === this.owner_id, `Only owner`);
  }

  checkOperator(address: string) {
    assert(this.operators.get(address), `Only operator`);
  }

  transfer({ amount, to }: { amount: bigint; to: AccountId }) {
    return NearPromise.new(to).transfer(amount);
  }

  @call({})
  approved_kyc({
    address,
    identifyId,
  }: {
    address: string;
    identifyId: string;
  }) {
    this.checkOperator(near.predecessorAccountId());
    const kyc = this.addressToKyc.get(address);
    assert(!kyc, "Kyc already");
    const newKyc: Kyc = {
      kycId: this.kyc_current_index.toString(),
      isBlocked: false,
      identifyId,
    };
    this.addressToKyc.set(address, newKyc);
    this.addressToKycAddress.set(address, address);
  }

  @call({})
  block_kyc({ address }: { address: string; identifyId: string }) {
    this.checkOperator(near.predecessorAccountId());
    assert(!this.addressToKyc.get(address).isBlocked, "Blocked already");
    this.addressToKyc.set(address, { isBlocked: true });
  }

  @call({ payableFunction: true })
  add_wallet_to_kyc({ address }: { address: string }) {
    const kyc = this.addressToKyc.get(near.predecessorAccountId());
    assert(!!kyc, "Require kyc address");
    assert(!kyc.isBlocked, "Blocked kyc");
    assert(near.attachedDeposit() >= this.fee, "Not enough fee");
    assert(!this.addressToKycAddress.get(address), "Already add");
    this.transfer({ amount: this.fee, to: this.receiver_fee });
    this.addressToKycAddress.set(address, near.predecessorAccountId());
  }

  @view({})
  get_my_kyc(): Kyc {
    return this.addressToKyc.get(near.predecessorAccountId());
  }

  @view({})
  get_fee(): bigint {
    return this.fee;
  }

  @view({})
  check_kyc({ address }: { address: string }) {
    const kycWallet = this.addressToKycAddress.get(address);
    if (kycWallet) {
      const kyc = this.addressToKyc.get(kycWallet);
      if (kyc) {
        return true;
      }
    }
    return false;
  }
}
