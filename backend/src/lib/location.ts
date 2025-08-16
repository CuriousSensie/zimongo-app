class LocationProvider {
  constructor() {}
  static async getCountryFromIP(ip: string): Promise<string> {
    const res = await fetch(`https://api.country.is/${ip}`,{
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // Mimic a real browser
      },
    });
    const {country} = await res.json()
    return country;
  }
  static getLocation(ip:string) {
    if (ip) {
        const userCountry = LocationProvider.getCountryFromIP(ip);
        return userCountry;
    }
    else{
      return "Unknown"
    }
  }
}
export default LocationProvider;
