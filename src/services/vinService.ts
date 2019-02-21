import { get } from "../utils/https"

export const filter = (vin: string) => {
    const invalidChars = new RegExp(/[IOQ]/, "g")

    return vin
        .toUpperCase()
        .replace(invalidChars, "")
        .substring(0, 17)
}

export const validate = (_vin: string): string => (_vin.length === 17 ? null : "17 chars expected")

export const convert = (_res: VinCheckResponse): CarInfo => {
    if (!_res || !_res.Results || _res.Results.length === 0) {
        return null
    }

    const getValue = (variable: string): string => {
        const results = _res.Results.filter((result: VinResultEntry) => result.Variable === variable)
        return results[0] ? results[0].Value : null
    }

    return {
        make: getValue("Make"),
        model: getValue("Model"),
        year: parseInt(getValue("Model Year"), 10),
        trim: getValue("Trim"),
        vehicleType: getValue("Vehicle Type")
    }
}

export const apiCheck = async (_vin: string): Promise<CarInfo> =>
    new Promise<CarInfo>((resolve, reject) => {
        const url = "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin"

        get(`${url}/${_vin}?format=json`)
            .then((response: any) => {
                if (response && response.Results && response.Results.length > 1) {
                    const info = convert(response as VinCheckResponse)

                    if (info) {
                        resolve(info)
                    }
                }

                reject(new Error("An error ocurred"))
            })
            .catch(error => {
                reject(new Error(error))
            })
    })
