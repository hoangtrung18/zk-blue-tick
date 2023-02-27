// Find all our documentation at https://docs.near.org
import {
  NearBindgen,
  near,
  call,
  view,
  LookupMap,
  initialize,
  assert,
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
  operators: LookupMap<boolean>;
  constructor() {
    this.owner_id = "";
    this.addressToKyc = new LookupMap("kyc");
    this.kyc_current_index = 1;
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
    this.operators[operator_address] = value;
  }

  checkOwner(address: string) {
    assert(address === this.owner_id, `Only owner`);
  }

  checkOperator(address: string) {
    assert(this.operators[address], `Only operator`);
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
    const kyc = this.addressToKyc[address];
    assert(!kyc, "Kyc already");
    const newKyc: Kyc = {
      kycId: this.kyc_current_index.toString(),
      isBlocked: false,
      identifyId,
    };
    this.addressToKyc[address] = newKyc;
    this.addressToKycAddress[address] = address;
  }

  @call({})
  block_kyc({ address }: { address: string; identifyId: string }) {
    this.checkOperator(near.predecessorAccountId());
    assert(!this.addressToKyc[address].isBlocked, "Blocked already");
    this.addressToKyc[address].isBlocked = true;
  }

  @call({})
  addWalletToKyc({ address }: { address: string }) {
    const kyc = this.addressToKyc[near.predecessorAccountId()];
    assert(!!kyc, "Require kyc address");
    assert(!kyc.isBlocked, "Blocked kyc");
    assert(!this.addressToKycAddress[address], "Already add");
    this.addressToKycAddress[address] = near.predecessorAccountId();
  }

  @view({})
  getMyKycInfo(): Kyc {
    return this.addressToKyc[near.predecessorAccountId()];
  }
}
