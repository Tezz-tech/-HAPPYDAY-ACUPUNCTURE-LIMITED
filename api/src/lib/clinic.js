import clinic from '../../../content/clinic.json' with { type: 'json' };

/** The clinic address as shown to patients, from content/clinic.json. */
export function clinicAddress() {
  return clinic.address.display;
}

export { clinic };
