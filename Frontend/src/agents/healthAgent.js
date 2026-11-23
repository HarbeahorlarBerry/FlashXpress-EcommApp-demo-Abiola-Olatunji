class HealthAgent {

  async execute(
    callback
  ) {

    try {

      return await callback();

    } catch {

      console.log(
        "AI agent retry..."
      );


      try {

        return await callback();

      } catch (
        error
      ) {

        console.error(
          "AI agent failed:",
          error
        );


        throw error;
      }
    }
  }
}


export default new HealthAgent();