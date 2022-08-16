import type {
  Dictionary,
  VCLOffers,
} from '@velocitycareerlabs/vcl-react-native';

export class Utils {
  static readonly getApprovedRejectedOfferIdsMock = (
    offers: VCLOffers
  ): string[][] => {
    var offerId1 = '';
    var offerId2 = '';
    if (offers.all.length > 0)
      offerId1 = (offers.all[0] as Dictionary<string>).id;
    if (offers.all.length > 1)
      offerId2 = (offers.all[1] as Dictionary<string>).id;

    let approvedOfferIds: string[] = [offerId1].filter(
      (offer) => offer.length > 0
    );
    let rejectedOfferIds: string[] = [offerId2].filter(
      (offer) => offer.length > 0
    );
    console.log(approvedOfferIds, rejectedOfferIds);

    return [approvedOfferIds, rejectedOfferIds];
  };
}
